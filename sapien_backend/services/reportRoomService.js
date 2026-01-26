const Report = require('../models/reportedContent.model');

exports.createReport = async (reportData) => {
  try {
    const report = new Report(reportData);
      return await report.save();
  }catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporterId', 'username email')
      .populate('roomId', 'name')
      .populate('messageId', 'content')
      .populate('resolvedBy', 'username');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      data: report
    });
  } catch (error) {
    console.error('Error getting report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get report'
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const reporterId = req.user.role === 'admin' ? null : req.user._id;

    const query = {};
    if (status) query.status = status;
    if (reporterId) query.reporterId = reporterId;

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: { createdAt: -1 },
      populate: [
        { path: 'reporterId', select: 'username' },
        { path: 'roomId', select: 'name' },
        { path: 'messageId', select: 'content' }
      ]
    };

    const reports = await Report.paginate(query, options);

    return res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      data: reports
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get reports'
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const update = { status };
    if (status === 'resolved') {
      update.resolvedAt = new Date();
      update.resolvedBy = req.user._id;
    }

    const report = await Report.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update report status'
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: report
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete report'
    });
  }
};