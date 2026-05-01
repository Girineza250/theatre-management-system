import apiClient from './client';

/**
 * API service for contact form
 * Handles sending contact messages
 */
const contactApi = {
  /**
   * Send a contact form message
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Sender's name
   * @param {string} contactData.email - Sender's email
   * @param {string} contactData.subject - Message subject
   * @param {string} contactData.message - Message content
   * @returns {Promise<Object>} Response
   */
  sendContactMessage: async (contactData) => {
    const response = await apiClient.post('/contact', contactData);
    return response.data;
  },

  /**
   * Get list of contact messages (Admin only)
   * @returns {Promise<Array>} List of contact messages
   */
  getContactMessages: async () => {
    const response = await apiClient.get('/admin/contact-messages');
    return response.data;
  },

  /**
   * Get a contact message by ID (Admin only)
   * @param {number|string} id - Message ID
   * @returns {Promise<Object>} Contact message details
   */
  getContactMessageById: async (id) => {
    const response = await apiClient.get(`/admin/contact-messages/${id}`);
    return response.data;
  },

  /**
   * Mark a contact message as read (Admin only)
   * @param {number|string} id - Message ID
   * @returns {Promise<Object>} Updated message
   */
  markMessageAsRead: async (id) => {
    const response = await apiClient.put(`/admin/contact-messages/${id}/read`);
    return response.data;
  },

  /**
   * Delete a contact message (Admin only)
   * @param {number|string} id - Message ID
   * @returns {Promise<Object>} Response
   */
  deleteContactMessage: async (id) => {
    const response = await apiClient.delete(`/admin/contact-messages/${id}`);
    return response.data;
  }
};

export default contactApi;