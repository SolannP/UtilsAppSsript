////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** [ ! ] READ ME
 * Those functions are made for providing a convenint way to deal with data inside GoogleDoc files
 * 
 * Feel free to add feature and improve code on https://github.com/SolannP/UtilsAppSsript
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** Function for update a value inside a GDoc document  
 * @param {string} idDoc the id of the GDocument, for exemple 1VcNPoX80CXHON83j1z05miHSdS0P_Gl35QuJ2BRS1EY in the doc https://docs.google.com/document/d/1VcNPoX80CXHON83j1z05miHSdS0P_Gl35QuJ2BRS1EY
 * @param {string} textSelector the text to replace. Usually located using {{ MY_DATA }}
 * @param {string} textToReplace the text data to replace
 * @author Solann Puygrenier <spuygrenier@fmlogistic.com>
 */
function ReplaceTextBy(idDoc,textSelector,dataToReplace){
    const doc = DocumentApp.openById(idDoc)
    //All of the content lives in the body, so we get that for editing
    const body = doc.getBody();
    //In this line we do some friendly date formatting, that may or may not work for you locale

    //In these lines, we replace our replacement tokens with values from our spreadsheet row
    body.replaceText(textSelector, dataToReplace);
}
