// In dev, use proxy (same origin); in prod, use backend URL
const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

export const SubmissionStatus = {
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong_answer',
  RUNTIME_ERROR: 'runtime_error',
  TIME_LIMIT_EXCEEDED: 'time_limit_exceeded',
  COMPILATION_ERROR: 'compilation_error',
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Request failed with status ${response.status}`;
    console.error('API Error Response:', errorMessage);
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data;
};

export const api = {
  fetchProblems: async () => {
    console.log('Fetching problems from:', `${API_BASE_URL}/problems`);
    try {
      const response = await fetch(`${API_BASE_URL}/problems`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await handleResponse(response);
      console.log('Fetched problems data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching problems:', error);
      throw error;
    }
  },

  fetchProblemById: async (id) => {
    console.log(`Fetching problem ${id} from:`, `${API_BASE_URL}/problems/${id}`);
    try {
      const response = await fetch(`${API_BASE_URL}/problems/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await handleResponse(response);
      console.log(`Fetched problem ${id} data:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching problem ${id}:`, error);
      throw error;
    }
  },

  submitSolution: async (submissionData) => {
    console.log('Submitting solution to:', `${API_BASE_URL}/submit`, submissionData);
    try {
      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      const data = await handleResponse(response);
      console.log('Submission response:', data);
      return data;
    } catch (error) {
      console.error('Error submitting solution:', error);
      throw error;
    }
  },

  runCode: async (submissionData) => {
    console.log('Running code at:', `${API_BASE_URL}/submit/run`, submissionData);
    try {
      const response = await fetch(`${API_BASE_URL}/submit/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      const data = await handleResponse(response);
      console.log('Run response:', data);
      return data;
    } catch (error) {
      console.error('Error running code:', error);
      throw error;
    }
  },

  chatWithAI: async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw error;
    }
  },

  fetchSolvedProblems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit/me/solved`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error fetching solved problems:', error);
      throw error;
    }
  },

  fetchUserSubmission: async (problemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit/me/problem/${problemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error(`Error fetching previous submission for problem ${problemId}:`, error);
      throw error;
    }
  },

  // Admin Endpoints
  addProblem: async (problemData) => {
    console.log('Adding problem:', problemData);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/problem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error adding problem:', error);
      throw error;
    }
  },

  deleteProblem: async (id) => {
    console.log(`Deleting problem ${id}`);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/problem/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error deleting problem:', error);
      throw error;
    }
  },

  addTestCase: async (testCaseData) => {
    console.log('Adding test case:', testCaseData);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/testcase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCaseData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error adding test case:', error);
      throw error;
    }
  },

  addHint: async (hintData) => {
    console.log('Adding hint:', hintData);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hintData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error adding hint:', error);
      throw error;
    }
  },

  updateProblem: async (id, problemData) => {
    console.log(`Updating problem ${id}:`, problemData);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/problem/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error updating problem:', error);
      throw error;
    }
  },

  getAdminProblem: async (id) => {
    console.log(`Fetching admin problem details ${id}`);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/problem/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error fetching admin problem:', error);
      throw error;
    }
  },

  getAdminSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      throw error;
    }
  },

  updateAdminSettings: async (settingsData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include'
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  resetPassword: async (username, email, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, newPassword })
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};