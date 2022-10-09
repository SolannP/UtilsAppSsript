////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** [ ! ] READ ME
 * Those functions are made for providing a convenint way to deal with data table inside GoogleShett files.
 * It tries to imitate Excel behavior of table, where title of column can be used as selector.
 * It's based on the design pattern "Chain of responsibility", but in an non ideal way.
 * 
 * Feel free to add feature and improve code on https://github.com/SolannP/UtilsAppSsript
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Object for filtering data table in a more user friendly manner.
 * You can fin exemples of use
 * 
 * @exemple Loop into matching selection
 * ```
 * var table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UnitTesting_SheetTableHelper").getRange("A1").getDataRegion();
 * var filterTable = new TableWithHeaderHelper(table).getTableWhereColumn("State").matchValue("In progress");
 * for(var i=0 ; i < filterTable.length() ; i++){
 *  var rangeCell = filterTable.getCellWithinColumn("User").atRow(i)
 *  ... do watever you want with the cell @see {@link https://developers.google.com/apps-script/reference/spreadsheet/range}
 * }
 * ```
 * 
 * @exemple match selection
 * ```
 * var table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UnitTesting_SheetTableHelper").getRange("A1").getDataRegion();
 * var filterTable = new TableWithHeaderHelper(table)
 *                          .getTableWhereColumn("State").matchValue("In progress")
 *                          .getTableWhereColumn("Mail").matchValueRegex(/.*@gmail.com/);
 *                          .getTableWhereColumn("Price").matchPredicate( (x) => ( x > 1000));
 * ```
 * 
 * @exemple ❌ bad match selection (we cannot chain matchValue for logical OR, AND,...).Instead use matchValueRegex
 * ```
 * // will not work
 * valueTable.getTableWhereColumn("User").matchValue("baba@rhum.com").matchValue("me@gmail.com");
 * ```
 * 
 * @author Solann Puygrenier <spuygrenier@fmlogistic.com>
 */
class TableWithHeaderHelper{
  constructor(range,firstTable = true){
    this.range = range;
    this.headerRange = this.initHeader(range);
    this.dataRowList = this.initRowList(range);
    this.dataMatchingList = firstTable ? this.initRowList(range) : [];
    this.columnFilter = [];
  }
  /** Next filter will be based on column title title of one column header. To be chained by a match function
  * @param {string} columnTitle the exact corresponding title
  */
  getTableWhereColumn(columnTitle){
    var filteredTableHelper = new TableWithHeaderHelper(this.range,false);
    var headerValues = this.headerRange.getValues()[0]
    var initialFilter = filteredTableHelper.columnFilter.length
    for(var i =0; i<headerValues.length; i++){
      if(headerValues[i] == columnTitle){
          filteredTableHelper.columnFilter.push({
          title:   columnTitle,
          index: i
        });
        break;
      }
    }
    if(initialFilter == filteredTableHelper.columnFilter.length) throw Error(`${columnTitle} is not among possible column title`)

    // transfert dataMatching
    filteredTableHelper.dataMatchingList = this.dataMatchingList;
    return filteredTableHelper;
  }
  /** Filter matching result based on exact content of one cell at column define before
  * @param {string} excact matching result
  */
  matchValue(filterMatching){
    var filteredTableHelper = new TableWithHeaderHelper(this.range,false);
    var initialFilter = filteredTableHelper.dataMatchingList.length
    // for each getTableWhereColumn
    for(var i=0; i < this.columnFilter.length; i++){
      var indexColumnCriterion = this.columnFilter[i].index
      // for each row among list
      for(var row=0; row<this.dataMatchingList.length; row++){
        if(this.dataMatchingList[row].getValues()[0][indexColumnCriterion] == filterMatching){
          filteredTableHelper.dataMatchingList.push(this.dataMatchingList[row])
        }
      }
    }
    if(initialFilter == filteredTableHelper.dataMatchingList.length) throw Error(`${filterMatching} is not among possible cell value`)
    return filteredTableHelper;
  }
  /** Filter matching result based on a predicate  of one cell at column define before
  * @param {predicate} the predicate returning boolean value
  */
  matchPredicate(predicate){
    var filteredTableHelper = new TableWithHeaderHelper(this.range,false);
    var initialFilter = filteredTableHelper.dataMatchingList.length
    // for each getTableWhereColumn
    for(var i=0; i < this.columnFilter.length; i++){
      var indexColumnCriterion = this.columnFilter[i].index
      // for each row among list
      for(var row=0; row<this.dataMatchingList.length; row++){
        if(predicate(this.dataMatchingList[row].getValues()[0][indexColumnCriterion])){
          filteredTableHelper.dataMatchingList.push(this.dataMatchingList[row])
        }
      }
    }
    if(initialFilter == filteredTableHelper.dataMatchingList.length) throw Error(`${filterMatching} is not among possible cell value`)
    return filteredTableHelper;
  }
  /** Filter matching result based on a regex match of one cell at column define before
  * @param {regex} js regex  notation, using /some[regex]/
  */
  matchValueRegex(regexMatching){
    var filteredTableHelper = new TableWithHeaderHelper(this.range,false);
    var initialFilter = filteredTableHelper.dataMatchingList.length
    // for each getTableWhereColumn
    for(var i=0; i < this.columnFilter.length; i++){
      var indexColumnCriterion = this.columnFilter[i].index
      // for each row among list
      for(var row=0; row<this.dataMatchingList.length; row++){
        if(this.dataMatchingList[row].getValues()[0][indexColumnCriterion].match(regexMatching)){
          filteredTableHelper.dataMatchingList.push(this.dataMatchingList[row])
        }
      }
    }
    if(initialFilter == filteredTableHelper.dataMatchingList.length) throw Error(`${filterMatching} is not among possible cell value`)
    return filteredTableHelper;
  }
  /**
   * Return the number of row of the filtered cell, without the header
   */
  length(){
    return this.dataMatchingList.length;
  }

  /** Next selection will be based on column title title of one column header. To be chained by a at function
  * @param {string} columnTitle the exact corresponding title
  */
  getCellWithinColumn(columnTitle){
    return this.getTableWhereColumn(columnTitle)
  }

  /**
   * 1 range cell of the matching result at the given index
   * @param {number} index starting at 0
   * @return {Range} 1 range cell at the given index @see {@link https://developers.google.com/apps-script/reference/spreadsheet/range}
   */
  atRow(index){
    var colunIndex = this.columnFilter[0].index
    if(this.length() <= index) throw Error(`index ${index} is not among possible value`)
    return this.dataMatchingList[index].getCell(1,colunIndex+1);
  }

  /** First row as int starting at 0 relativ to the whole sheet
  /** @private */getOffsetRow(){
    return this.range.getLastRow() - this.range.getNumRows();
  }
  /** First column as int starting at 0 relativ to the whole sheet */
  /** @private */getOffsetColumn(){
    return this.range.getLastColumn() - this.range.getNumColumns();
  }
  /** Provdide the header of the table */
  /** @private */initHeader(range){
    return this.subRangeRow(0);
    //return range.getSheet().getRange(1 + this.getOffsetRow(), 1+ this.getOffsetColumn(), 1, range.getWidth()); 
  }
  /** Provdide the data body of the table, call for the first instantiation */
  /** @private */initRowList(range){
    var array =[];
    for(var i= 1; i < range.getNumRows(); i++) {
      //array.push(range.getSheet().getRange(1 + i  + this.getOffsetRow(), 1 + this.getOffsetColumn(), range.getNumRows(), 1))
      array.push(this.subRangeRow(i))
    }
    return array;
  }
  /** Provdide sub range*/
  /** @private */
  subRangeRow(rowNumberInTable,range = this.range){
    // The starting row index of the range; row indexing starts with 1.
    var row = 1 + rowNumberInTable + this.getOffsetRow()   
    // The starting column index of the range; column indexing starts with 1.
    var column =1+ this.getOffsetColumn(); 
    // The number of rows to return.                
    var numRows = 1 ;         
    // The number of columns to return.                             
    var numColumns = range.getWidth();                     
    return range.getSheet().getRange(row,column , numRows, numColumns); 
  }
}


class BasicTesting {
  constructor(){
    this.recapMessage = "";
  }
  create(titleTest,current,expected){
    if(current != expected)  {
      this.recapMessage += `🔴 ${titleTest} should be ${expected} but got ${current} \n`
    }
    else  {
      this.recapMessage += `🟢 ${titleTest}\n`
    }
  }
  toString(){
    return this.recapMessage;
  }
}


/**
 * The function bellow is an exemple of possible use. It work as test on a deffined data set
 * Many link have been use for prior to realise this function.
 * See :
 *  - https://stackoverflow.com/questions/36346918/get-column-values-by-column-name-not-column-index
 *  - https://stackoverflow.com/questions/61641925/how-can-row-1-first-row-of-sheet-be-excluded-in-getactiverange-when-it-is-in
 *  - https://stackoverflow.com/questions/11947590/sheet-getrange1-1-1-12-what-does-the-numbers-in-bracket-specify
 *  - https://stackoverflow.com/questions/51392301/getting-a-range-from-a-range-in-google-apps-scripting
 */
function UnitTest(){
  var table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UnitTesting_SheetTableHelper").getRange("B2").getDataRegion();
  var table2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UnitTesting_SheetTableHelper").getRange("H12").getDataRegion();
  var table3 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UnitTesting_SheetTableHelper").getRange("O3").getDataRegion();

  var valueTable = new TableWithHeaderHelper(table);
  var valueTable2 = new TableWithHeaderHelper(table2);
  var test = new BasicTesting()

  test.create("getOffsetRow",valueTable.getOffsetRow(),"0")
  test.create("getOffsetRow",valueTable2.getOffsetRow(),"11")
  test.create("getOffsetColumn",valueTable.getOffsetColumn(),"0")
  test.create("getOffsetColumn",valueTable2.getOffsetColumn(),"7")

  test.create("headerRange",valueTable.headerRange.getValues()[0][0],'State')
  test.create("headerRange",valueTable.headerRange.getValues()[0][2],'User')

	test.create("dataRowList",valueTable.dataRowList[9].getValues()[0][0],109);
  test.create("dataRowList",valueTable.dataRowList[9].getValues()[0][1],"WDP-456");
  test.create("dataRowList",valueTable.dataRowList[9].getValues()[0][2],"baba@rhum.com");

  test.create("dataRowList",valueTable2.dataRowList[9].getValues()[0][0],109);
  test.create("dataRowList",valueTable2.dataRowList[9].getValues()[0][1],"WDP-456");
  test.create("dataRowList",valueTable2.dataRowList[9].getValues()[0][2],"baba@rhum.com");

  test.create("getTableWhereColumn",valueTable.getTableWhereColumn("User").columnFilter[0].title,"User");
  test.create("getTableWhereColumn",valueTable.getTableWhereColumn("User").columnFilter[0].index,"2");

  test.create("getTableWhereColumn",valueTable2.getTableWhereColumn("User").columnFilter[0].title,"User");
  test.create("getTableWhereColumn",valueTable2.getTableWhereColumn("User").columnFilter[0].index,"2");

  test.create("matchValue",(new TableWithHeaderHelper(table)).getTableWhereColumn("User").matchValue("me@gmail.com").dataMatchingList.length,3);
  test.create("matchValue",valueTable.getTableWhereColumn("User").matchValue("baba@rhum.com").length(),1);
  test.create("matchValue",valueTable.getTableWhereColumn("User").matchValue("baba@rhum.com").dataMatchingList[0].getValues()[0].toString(),"109,WDP-456,baba@rhum.com");

  test.create("matchValue",valueTable2.getTableWhereColumn("User").matchValue("me@gmail.com").length(),3);
  test.create("matchValue",valueTable2.getTableWhereColumn("User").matchValue("baba@rhum.com").length(),1);
  test.create("matchValue",valueTable2.getTableWhereColumn("User").matchValue("baba@rhum.com").dataMatchingList[0].getValues()[0].toString(),"109,WDP-456,baba@rhum.com");

  test.create("matchValueRegex",valueTable.getTableWhereColumn("User").matchValueRegex(/(baba@rhum.com|me@gmail.com),(baba@rhum.com|me@gmail.com)/).dataMatchingList[0].getValues()[0].toString(),"110,WDP-002,baba@rhum.com,me@gmail.com");

  /* BAD USE :
   *  - cannot chain matchValue for logical OR, AND : ❌ valueTable.getTableWhereColumn("User").matchValue("baba@rhum.com").matchValue("me@gmail.com");
   *    Instead use matchValueRegex
   */ 

  test.create("matchPredicate",new TableWithHeaderHelper(table3).getTableWhereColumn("Value").matchPredicate( (x) => x >= 100).dataMatchingList.map( allRange => allRange.getValues()[0].toString()).toString(),"100,c,120,d");
  test.create("matchPredicate",new TableWithHeaderHelper(table3).getTableWhereColumn("Value").matchPredicate( (x) => x <= 100).dataMatchingList.map( allRange => allRange.getValues()[0].toString()).toString(),"1,a,2,b,100,c");
  test.create("matchPredicate length",new TableWithHeaderHelper(table3).getTableWhereColumn("Value").matchPredicate( (x) => x < 100).length(),2);


  test.create("match list",
    valueTable.getTableWhereColumn("State").matchValue("110")
              .getTableWhereColumn("User").matchValue("jacky@gmail.com")
              .dataMatchingList.map( allRange => allRange.getValues()[0].toString()).toString(),"110,WDP-001,jacky@gmail.com");

  test.create("match list",
    valueTable2.getTableWhereColumn("State").matchValue("110")
              .getTableWhereColumn("User").matchValue("jacky@gmail.com")
              .dataMatchingList.map( allRange => allRange.getValues()[0].toString()).toString(),"110,WDP-001,jacky@gmail.com");

  test.create("get Cell",
    valueTable.getTableWhereColumn("State").matchValue("110")
              .getTableWhereColumn("User").matchValue("jacky@gmail.com")
              .getCellWithinColumn("User").atRow(0).getValue(),"jacky@gmail.com");

  try{ valueTable.getTableWhereColumn("456987fds!:;"); test.create("error getTableWhereColumn","succes","error");
  }catch {test.create("error getTableWhereColumn","error","error")}
  try{ valueTable.getTableWhereColumn("User").matchValue("456987fds!:;"); test.create("error matchValue","succes","error");
  }catch {test.create("error matchValue","error","error")}
  try{ valueTable.getTableWhereColumn("User").matchValue(/(jkljlkipo op),(baba@rhum.com|me@gmail.com)/); test.create("error matchValueRegex","succes","error");
  }catch {test.create("error matchValueRegex","error","error")}


  console.log(test.toString());
  //TODO getTableWhereColumn: prevent matching getTableWhereColumn twice the same
  //TODO getTableWhereColumn: replace array by object getTableWhereColumn 
  //TODO better Error checking
}
