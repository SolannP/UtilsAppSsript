////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** [ ! ] READ ME
 * Those functions are made for providing a convenint way to initialise files and folders.
 * It can be use on a personal or shared Google drive because of use of Drive API rather than DriveApp
 * @requires Install the advanced service : "Drive API"  (V2) See tab "Services" at the left
 * @see {@link https://developers.google.com/apps-script/advanced/drive}
 * @see {@link https://developers.google.com/drive/api/v2/reference}
 * 
 * Feel free to add feature and improve code on https://github.com/SolannP/UtilsAppSsript
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** Function for create a new Gdrive on shared or personal drive, may @throws error if refering objects don't exist or right are not enought or  
 * @param {string} ROOT_DRIVE_ID
 * @param {string} NEW_DRIVE_NAME
 * @param {string} NEW_DRIVE_DESCRIPTION
 * @see {@link https://developers.google.com/drive/api/v2/reference}
 * @author Solann Puygrenier <spuygrenier@fmlogistic.com>
 */
function CreateNewFolderAt(ROOT_DRIVE_ID, NEW_DRIVE_NAME, NEW_DRIVE_DESCRIPTION) {
  CheckNotNullInputOfFolder(ROOT_DRIVE_ID, NEW_DRIVE_NAME);
  CheckIsExistingDriveObject(ROOT_DRIVE_ID);
  CheckIsAllowedToEdit(ROOT_DRIVE_ID);

  const optionalArgs = { supportsAllDrives: true };
  const mimeTypeForFolderCreation = "application/vnd.google-apps.folder";
  var resource = {
    title: NEW_DRIVE_NAME,
    description: NEW_DRIVE_DESCRIPTION,
    mimeType: mimeTypeForFolderCreation,
    parents: [{
      "id": ROOT_DRIVE_ID
    }]
  }

  var idNewFolder
  try { idNewFolder = Drive.Files.insert(resource, null, optionalArgs).id; }
  catch (e) { throw new Error("Error into folder creation steep\n stack :" + e) }

  return idNewFolder;
}

/**
 * Function for execute copy of a file from one drive to another, , may @throws error if refering objects don't exist or right are not enought or  
 * @param {string} idFileToCopy
 * @param {string} idFolderReceivingFile
 * @see {@link https://developers.google.com/drive/api/v2/reference}
 * @author Solann Puygrenier <spuygrenier@fmlogistic.com> 
 */
function CopyTemplateFile(idFileToCopy, idFolderReceivingFile, nameOfCopy = "DEFAULT TITLE") {
  CheckNotNullInput(idFileToCopy,idFolderReceivingFile,nameOfCopy);
  var driveObjectToCopy = CheckIsExistingDriveObject(idFileToCopy)
  var driveFolderReceivingCopy = CheckIsExistingDriveObject(idFolderReceivingFile)
  CheckIsAllowedToEdit(idFolderReceivingFile);

  const optionalArgs = { supportsAllDrives: true, convert: false };
  //const mimeTypeForFolderCreation = "application/vnd.google-apps.folder";
  const metadata = {
    title:nameOfCopy,
    parents: [{ id: driveFolderReceivingCopy.id }],
  };

  var idNewItem
  try { idNewItem = Drive.Files.copy(metadata, driveObjectToCopy.id, optionalArgs); }
  catch (e) { throw new Error("Error into copy steep: " + e) }
  return idNewItem.id;
}

function CheckNotNullInputOfFolder(ROOT_DRIVE_ID, NEW_DRIVE_NAME) {
  var ErrorMessage = "";
  const [_ROOT_DRIVE_ID] = Object.keys({ ROOT_DRIVE_ID })
  const [_NEW_DRIVE_NAME] = Object.keys({ NEW_DRIVE_NAME })
  if (ROOT_DRIVE_ID === undefined || ROOT_DRIVE_ID === null || ROOT_DRIVE_ID === "") ErrorMessage += `Error on input, have been provided : ${_ROOT_DRIVE_ID} = ${ROOT_DRIVE_ID}\n`
  if (NEW_DRIVE_NAME === undefined || NEW_DRIVE_NAME === null || NEW_DRIVE_NAME === "") ErrorMessage += `Error on input, have been provided : ${_NEW_DRIVE_NAME} = ${NEW_DRIVE_NAME}\n`
  if (ErrorMessage === "") return;
  else throw new Error(ErrorMessage);
}

function CheckNotNullInput(...inputs) {
  var ErrorMessage = "";
  for(const input in inputs){
    if (input === undefined || input === null || input === "") ErrorMessage += `Error on input, have been provided : ${input}\n`
  }
  if (ErrorMessage === "") return;
  else throw new Error(ErrorMessage);
}


function CheckIsExistingDriveObject(idGoogleItem) {
  const optionalArgs = { supportsAllDrives: true };
  var driveItem;
  try {
    driveItem = Drive.Files.get(idGoogleItem, optionalArgs);
  }
  catch (e) {
    const [_driveItem] = Object.keys({ driveItem })
    throw new Error(`Inexisting google drive object, have been provided : ${_driveItem} = ${idGoogleItem}\n trace: ${e}`);
  }
  return driveItem
}

function CheckIsExistingSharedFolderObject(idGoogleItem){
  const optionalArgs = { supportsAllDrives: true };
  var driveItem;
  try {
    driveItem = Drives.get(idGoogleItem, optionalArgs);
  }
  catch (e) {
    const [_driveItem] = Object.keys({ driveItem })
    throw new Error(`Inexisting google drive object, have been provided : ${_driveItem} = ${idGoogleItem}\n trace: ${e}`);
  }
  return driveItem
}

function CheckIsAllowedToEdit(idGoogleDriveObject) {
  var googleDriveObject = CheckIsExistingDriveObject(idGoogleDriveObject);
  if (googleDriveObject.editable) return googleDriveObject;
  else {
    throw new Error(`Right not enought to edit folder ${googleDriveObject.title}`)
  }
}
