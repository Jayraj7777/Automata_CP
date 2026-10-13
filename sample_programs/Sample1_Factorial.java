// Sample 1: Factorial Demonstration
// Exercises keywords: public, class, static, int, if, return, else, void
package math.demo;

public class FactorialCalculator {
    public static int compute(int n) {
        // Base case for recursive factorial calculation
        if (n <= 1) {
            return 1;
        } else {
            return n * compute(n - 1);
        }
    }

    public static void main(String[] args) {
        int number = 5;
        int result = compute(number);
        System.out.println("Factorial of " + number + " is " + result);
    }
}
