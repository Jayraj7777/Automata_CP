// Sample 2: Binary Search
// Exercises keywords: package, public, class, static, int, while, if, return, else
package algorithms.search;

public class BinarySearch {
    public static int search(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                return mid; // Found target at index mid
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1; // Target not found in array
    }
}
