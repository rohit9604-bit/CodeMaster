import json

def solve(nums):
    ans = 0
    freq = {(0, 1): 1}
    prefix = 0
    
    for j in range(len(nums)):
        if nums[j] > 0:
            prefix += 1
        elif nums[j] < 0:
            prefix -= 1
            
        target_parity = j % 2
        state = (prefix, target_parity)
        
        ans += freq.get(state, 0)
        freq[state] = freq.get(state, 0) + 1
        
    return ans

if __name__ == '__main__':
    with open('tc3.json', 'r') as f:
        tcs = json.load(f)
        
    for i, tc in enumerate(tcs):
        # The input format is typically something like "[[1, -1, 2, -2]]"
        raw_input = tc['input']
        parsed = json.loads(raw_input)
        
        # It's a list inside a list based on our DB analysis
        if isinstance(parsed, list) and len(parsed) > 0 and isinstance(parsed[0], list):
            nums = parsed[0]
        else:
            nums = parsed
            
        res = solve(nums)
        expected = tc['expected_output'].strip('"')
        print(f"Test Case {i+1}:")
        print(f"  Input: {nums}")
        print(f"  Output: {res} | Expected: {expected}")
        if str(res) != expected:
            print("  [FAIL]")
        else:
            print("  [PASS]")
