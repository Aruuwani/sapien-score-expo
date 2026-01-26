import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Phone } from 'lucide-react';
import { getUserProfile } from '@/api/userApi';
import { useApp } from '@/context/AppContext';
import { toast } from 'react-toastify';
import './UserSelectionScreen.css';

interface Person {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
}

interface User {
  work_email?: string;
  email?: string;
  phone_number?: string;
}

// Type for Contact Picker API
interface ContactInfo {
  name?: string[];
  email?: string[];
  tel?: string[];
}

// Extend Navigator type for Contact Picker API
declare global {
  interface Navigator {
    contacts?: {
      select: (properties: string[], options?: { multiple?: boolean }) => Promise<ContactInfo[]>;
      getProperties: () => Promise<string[]>;
    };
  }
  interface Window {
    ContactsManager?: any;
  }
}

// Check if Contact Picker API is available
const isContactPickerSupported = (): boolean => {
  const supported = 'contacts' in navigator && 'ContactsManager' in window;
  console.log('[ContactPicker] API supported:', supported);
  return supported;
};

const UserSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedPerson, setReceiverID } = useApp();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User>({});
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [contactPickerAvailable, setContactPickerAvailable] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ name: string, phone?: string, email?: string } | null>(null);

  useEffect(() => {
    // Check Contact Picker support on mount
    const supported = isContactPickerSupported();
    setContactPickerAvailable(supported);

    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUser(response?.user || {});
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (email) setEmailError('');
  }, [email]);

  useEffect(() => {
    if (phone) setPhoneError(false);
  }, [phone]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return phone.length >= 10;
  };

  const formatPhoneWithCountryCode = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
      return `+${digitsOnly}`;
    }
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    return phone;
  };

  // Extract name from email (before @)
  const extractNameFromEmail = (email: string): string => {
    const prefix = email.split('@')[0];
    return prefix
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Handle Contact Picker - opens native contact picker
  const handlePickContact = useCallback(async () => {
    console.log('[ContactPicker] Attempting to pick contact...');

    if (!navigator.contacts) {
      console.error('[ContactPicker] navigator.contacts is undefined');
      toast.error('Contact picker not available. Use Chrome on Android.');
      return;
    }

    try {
      console.log('[ContactPicker] Calling navigator.contacts.select...');
      const contacts = await navigator.contacts.select(
        ['name', 'email', 'tel'],
        { multiple: false }
      );

      console.log('[ContactPicker] Contacts selected:', contacts);

      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const contactData = {
          name: contact.name?.[0] || '',
          email: contact.email?.[0] || '',
          phone: contact.tel?.[0] || ''
        };

        console.log('[ContactPicker] Selected contact:', contactData);

        // Save contact name to localStorage for future reference
        const saveContactToLocalStorage = (phone: string, name: string) => {
          if (!phone || !name) return;
          try {
            const storedContacts = localStorage.getItem('sapien_contacts') || '{}';
            const contacts = JSON.parse(storedContacts);
            // Normalize phone: remove non-digits and store last 10 digits as key
            const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
            contacts[normalizedPhone] = name;
            localStorage.setItem('sapien_contacts', JSON.stringify(contacts));
            console.log('[ContactPicker] Saved to localStorage:', normalizedPhone, '->', name);
          } catch (e) {
            console.error('[ContactPicker] Failed to save to localStorage:', e);
          }
        };

        // Prefer phone number
        if (contactData.phone) {
          const formattedPhone = formatPhoneWithCountryCode(contactData.phone);
          setPhone(formattedPhone);
          setSelectedContact({ name: contactData.name, phone: formattedPhone });
          setEmail('');
          // Save to localStorage
          saveContactToLocalStorage(formattedPhone, contactData.name);
        } else if (contactData.email) {
          setEmail(contactData.email);
          setIsValidEmail(validateEmail(contactData.email));
          setSelectedContact({ name: contactData.name, email: contactData.email });
          setPhone('');
        }
      }
    } catch (error: any) {
      console.error('[ContactPicker] Error:', error);

      if (error.name === 'InvalidStateError') {
        toast.error('Please allow contact access in your browser settings');
      } else if (error.name === 'SecurityError') {
        toast.error('Contact access requires HTTPS or localhost');
      } else if (error.name !== 'TypeError') {
        toast.error('Could not access contacts: ' + error.message);
      }
    }
  }, []);

  const handleNext = async () => {
    setLoading(true);
    setEmailError('');

    try {
      // Get all of the logged-in user's identifiers for self-scoring check
      const loggedInUserEmail = user?.email || '';
      const loggedInUserWorkEmail = user?.work_email || '';
      const loggedInUserPhone = formatPhoneWithCountryCode(user?.phone_number || '');

      if (email.trim()) {
        const trimmedEmail = email.trim().toLowerCase();

        // Check if entered email matches ANY of the user's emails (email OR work_email)
        const isSelfEmail =
          (loggedInUserEmail && trimmedEmail === loggedInUserEmail.toLowerCase()) ||
          (loggedInUserWorkEmail && trimmedEmail === loggedInUserWorkEmail.toLowerCase());

        if (isSelfEmail) {
          setCustomMessage("You cannot score yourself. This email is linked to your account.");
          setTimeout(() => setCustomMessage(''), 3000);
          setLoading(false);
          return;
        }

        if (!validateEmail(trimmedEmail)) {
          setEmailError('Please enter a valid email address');
          return;
        }

        const personName = selectedContact?.name || extractNameFromEmail(trimmedEmail);

        const personData = {
          id: trimmedEmail,
          name: personName,
          email: trimmedEmail
        };

        console.log('Setting selected person:', personData);
        setSelectedPerson(personData);
        setReceiverID(trimmedEmail);
        navigate('/relationship-selection');
      } else if (phone.trim()) {
        const formattedPhone = formatPhoneWithCountryCode(phone.trim());

        // Check if entered phone matches the user's phone number
        if (loggedInUserPhone && formattedPhone === loggedInUserPhone) {
          setCustomMessage("You cannot score yourself. This phone number is linked to your account.");
          setTimeout(() => setCustomMessage(''), 3000);
          setLoading(false);
          return;
        }

        const personName = selectedContact?.name || 'Contact';

        const personData = {
          id: formattedPhone,
          name: personName,
          phone_number: formattedPhone
        };

        console.log('Setting selected person:', personData);
        setSelectedPerson(personData);
        setReceiverID(formattedPhone);
        navigate('/relationship-selection');
      } else {
        setEmailError('Please enter an email or phone number');
      }
    } catch (error) {
      console.error('Handle next error:', error);
      setCustomMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const hasValidInput = email.trim() || phone.trim();

  return (
    <div className="user-selection-container isalreadyselected">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={24} color="black" />
      </button>

      <div className="header-container">
        <h1 className="header-text">
          Whom do you want to score?
        </h1>
        <p className="sub-header-text">
          your name will not be revealed while<br />sharing the score
        </p>
      </div>

      <div className="input-containermain">
        <input
          type="email"
          className={`email-input ${emailError ? 'invalid-input' : ''} ${!isValidEmail && email.length > 0 ? 'invalid-input' : ''}`}
          placeholder="Enter Corporate Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setIsValidEmail(validateEmail(e.target.value));
            setEmailError('');
            setSelectedContact(null);
            setPhone('');
          }}
        />
        {emailError && (
          <p className="email-error-text">{emailError}</p>
        )}

        <p className="or-text">or</p>

        {/* Phone Input with Contact Picker Icon */}
        <div className="phone-input-container">
          <input
            type="tel"
            className="phone-input"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setEmail('');
              setSelectedContact(null);
            }}
          />
          {contactPickerAvailable && (
            <button
              className="contact-picker-icon"
              onClick={handlePickContact}
              title="Select from Contacts"
            >
              <Users size={20} />
            </button>
          )}
        </div>

        {/* Show selected contact name if available */}
        {selectedContact && (
          <p className="selected-contact-label">
            {selectedContact.name}
          </p>
        )}

        {!contactPickerAvailable && (
          <p className="contact-fallback-text">
            Contact picker available on Chrome Android only
          </p>
        )}
      </div>

      <button
        className="skip-button"
        onClick={() => hasValidInput ? handleNext() : handleSkip()}
        disabled={loading}
      >
        <span className="skip-text">{hasValidInput ? 'next' : 'skip'}</span>
      </button>

      {customMessage && (
        <>
          <div className="message-overlay" />
          <div className="message-container">
            <div className="custom-message">{customMessage}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserSelectionScreen;
