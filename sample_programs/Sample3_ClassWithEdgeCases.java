// Sample 3: Keywords vs Identifiers & Masked Comments/Strings Edge Cases
// Tests prefix cases: ifx, className, integer, isTrue
// Tests masked strings and comments containing keywords
package test.edgecases;

public class EdgeCaseTest {
    private int ifx = 100;           // 'ifx' is an IDENTIFIER, not keyword 'if'
    private String className = "A";   // 'className' is an IDENTIFIER, not 'class'
    private boolean isTrue = true;    // 'true' is keyword literal, 'isTrue' is identifier

    public void executeLogic() {
        /* Multi-line comment block:
           Keywords listed here should NEVER be counted as tokens:
           while for do switch case break continue
        */
        String logMessage = "String literal with 'public static void main' must be ignored";
        
        try {
            int count = 0;
            while (count < 5) {
                count++;
                if (count == 3) {
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // cleanup resources
        }
    }
}
