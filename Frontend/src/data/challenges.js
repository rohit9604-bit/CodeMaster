export const challenges = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "Only one valid answer exists"
      ],
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        }
      ],
      acceptanceRate: 49.2,
      starterCode: {
        javascript: "function twoSum(nums, target) {\n  // Your code here\n}",
        python: "def two_sum(nums, target):\n    # Your code here\n    pass",
        java: "public int[] twoSum(int[] nums, int target) {\n    // Your code here\n}",
        cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}"
      }
    },
    {
      id: 2,
      title: "Valid Parentheses",
      difficulty: "Easy",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      constraints: [
        "1 <= s.length <= 10^4",
        "s consists of parentheses only '()[]{}'."
      ],
      examples: [
        {
          input: 's = "()"',
          output: "true"
        },
        {
          input: 's = "()[]{}"',
          output: "true"
        },
        {
          input: 's = "(]"',
          output: "false"
        }
      ],
      acceptanceRate: 40.1,
      starterCode: {
        javascript: "function isValid(s) {\n  // Your code here\n}",
        python: "def is_valid(s):\n    # Your code here\n    pass",
        java: "public boolean isValid(String s) {\n    // Your code here\n}",
        cpp: "bool isValid(string s) {\n    // Your code here\n}"
      }
    },
    {
      id: 3,
      title: "Merge Two Sorted Lists",
      difficulty: "Easy",
      description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
      constraints: [
        "The number of nodes in both lists is in the range [0, 50].",
        "-100 <= Node.val <= 100",
        "Both lists are sorted in non-decreasing order."
      ],
      examples: [
        {
          input: "list1 = [1,2,4], list2 = [1,3,4]",
          output: "[1,1,2,3,4,4]"
        }
      ],
      acceptanceRate: 61.5,
      starterCode: {
        javascript: "function mergeTwoLists(list1, list2) {\n  // Your code here\n}",
        python: "def merge_two_lists(list1, list2):\n    # Your code here\n    pass",
        java: "public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n    // Your code here\n}",
        cpp: "ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    // Your code here\n}"
      }
    },
    {
      id: 4,
      title: "Maximum Subarray",
      difficulty: "Medium",
      description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
      constraints: [
        "1 <= nums.length <= 10^5",
        "-10^4 <= nums[i] <= 10^4"
      ],
      examples: [
        {
          input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
          output: "6",
          explanation: "[4,-1,2,1] has the largest sum = 6."
        }
      ],
      acceptanceRate: 50.3,
      starterCode: {
        javascript: "function maxSubArray(nums) {\n  // Your code here\n}",
        python: "def max_sub_array(nums):\n    # Your code here\n    pass",
        java: "public int maxSubArray(int[] nums) {\n    // Your code here\n}",
        cpp: "int maxSubArray(vector<int>& nums) {\n    // Your code here\n}"
      }
    },
    {
      id: 5,
      title: "3Sum",
      difficulty: "Medium",
      description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
      constraints: [
        "3 <= nums.length <= 3000",
        "-10^5 <= nums[i] <= 10^5"
      ],
      examples: [
        {
          input: "nums = [-1,0,1,2,-1,-4]",
          output: "[[-1,-1,2],[-1,0,1]]"
        }
      ],
      acceptanceRate: 32.1,
      starterCode: {
        javascript: "function threeSum(nums) {\n  // Your code here\n}",
        python: "def three_sum(nums):\n    # Your code here\n    pass",
        java: "public List<List<Integer>> threeSum(int[] nums) {\n    // Your code here\n}",
        cpp: "vector<vector<int>> threeSum(vector<int>& nums) {\n    // Your code here\n}"
      }
    },
    {
      id: 6,
      title: "Longest Palindromic Substring",
      difficulty: "Medium",
      description: "Given a string s, return the longest palindromic substring in s.",
      constraints: [
        "1 <= s.length <= 1000",
        "s consist of only digits and English letters."
      ],
      examples: [
        {
          input: 's = "babad"',
          output: '"bab" or "aba"'
        }
      ],
      acceptanceRate: 32.8,
      starterCode: {
        javascript: "function longestPalindrome(s) {\n  // Your code here\n}",
        python: "def longest_palindrome(s):\n    # Your code here\n    pass",
        java: "public String longestPalindrome(String s) {\n    // Your code here\n}",
        cpp: "string longestPalindrome(string s) {\n    // Your code here\n}"
      }
    },
    {
      id: 7,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
      constraints: [
        "nums1.length == m",
        "nums2.length == n",
        "0 <= m <= 1000",
        "0 <= n <= 1000",
        "1 <= m + n <= 2000"
      ],
      examples: [
        {
          input: "nums1 = [1,3], nums2 = [2]",
          output: "2.00000",
          explanation: "merged array = [1,2,3] and median is 2."
        }
      ],
      acceptanceRate: 35.4,
      starterCode: {
        javascript: "function findMedianSortedArrays(nums1, nums2) {\n  // Your code here\n}",
        python: "def find_median_sorted_arrays(nums1, nums2):\n    # Your code here\n    pass",
        java: "public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n    // Your code here\n}",
        cpp: "double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    // Your code here\n}"
      }
    },
    {
      id: 8,
      title: "Regular Expression Matching",
      difficulty: "Hard",
      description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
      constraints: [
        "1 <= s.length <= 20",
        "1 <= p.length <= 30",
        "s contains only lowercase English letters.",
        "p contains only lowercase English letters, '.', and '*'."
      ],
      examples: [
        {
          input: 's = "aa", p = "a"',
          output: "false"
        },
        {
          input: 's = "aa", p = "a*"',
          output: "true"
        }
      ],
      acceptanceRate: 27.9,
      starterCode: {
        javascript: "function isMatch(s, p) {\n  // Your code here\n}",
        python: "def is_match(s, p):\n    # Your code here\n    pass",
        java: "public boolean isMatch(String s, String p) {\n    // Your code here\n}",
        cpp: "bool isMatch(string s, string p) {\n    // Your code here\n}"
      }
    }
  ];
  
  export const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };
  
  export const getDifficultyBgColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 border-green-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'Hard':
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };