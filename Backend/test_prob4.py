import json
import sys
sys.setrecursionlimit(2000)

def rob(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]

    def solve_linear(arr):
        memo = {}
        def dp(i):
            if i >= len(arr):
                return 0
            if i in memo:
                return memo[i]
            
            # Recurrence relation for robbery
            # Max of: skipping current house, or robbing current house and skipping next
            memo[i] = max(dp(i + 1), arr[i] + dp(i + 2))
            return memo[i]
        
        return dp(0)

    # Circular array logic: Max of robbing 0 to n-2 OR robbing 1 to n-1
    return max(solve_linear(nums[:-1]), solve_linear(nums[1:]))

if __name__ == '__main__':
    with open('tc4.json', 'r') as f:
        tcs = json.load(f)
        
    for i, tc in enumerate(tcs):
        raw_input = tc['input']
        parsed = json.loads(raw_input)
        
        if isinstance(parsed, list) and len(parsed) > 0 and isinstance(parsed[0], list):
            nums = parsed[0]
        else:
            nums = parsed
            
        res = rob(nums)
        expected = tc['expected_output'].strip('"')
        print(f"Test Case {i+1}:")
        print(f"  Input: {nums}")
        print(f"  Output: {res} | Expected: {expected}")
        if str(res) != expected:
            print("  [FAIL]")
        else:
            print("  [PASS]")
