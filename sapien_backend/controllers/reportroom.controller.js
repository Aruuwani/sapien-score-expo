const reportService = require('../services/reportRoomService');

exports.createReport = async (req, res) => {
  try {
    console.log('req.body', req.body)
    console.log('req.userId', req.userId)
    // Validate required fields
    if (!req.body.reason || (!req.body.roomId )) {
      return res.status(400).json({
        success: false,
        message: 'Reason and either roomId or messageId are required'
      });
    }

    const reportData = {
      ...req.body,
      reporterId: req.userId,
      status: 'pending'
    };

    const report = await reportService.createReport(reportData);
    return res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create report'
    });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
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
      message: error.message || 'Failed to get report'
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const reporterId = req.user.role === 'admin' ? null : req.user._id;
    
    const reports = await reportService.getAllReports({
      status,
      reporterId,
      page: req.query.page || 1,
      limit: req.query.limit || 10
    });

    return res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      data: reports
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get reports'
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const report = await reportService.updateReportStatus(id, status, req.user._id);
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
      message: error.message || 'Failed to update report status'
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await reportService.deleteReport(req.params.id);
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
      message: error.message || 'Failed to delete report'
    });
  }
};