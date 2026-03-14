import cron from 'node-cron';
import jsonfile from 'jsonfile';
import fs from 'fs';


const deleteUserFilesOverWeekOld = () => {
    cron.schedule('0 7 * * *', () => {
        const jsonFilePath = "./uploads/userFiles/files.json";
        const fileData = [];
        const date = new Date();
        const pastDate = new Date(date);
        pastDate.setDate(pastDate.getDate() - 7);
        const dayWeekAgo = new Date(pastDate).getDate();
        jsonfile.readFile(jsonFilePath, (err, obj) => {
            if(err){
                console.log(`error while reading file ${err}`);
            }
            else{
                fileData = [...obj];
            }
        });
        fileData.forEach(fd => {
            const dateParts = fd.date.split(".");
            let filePathToDelete = `./uploads/userFiles/${fd.senderId}`;
            const folderFiles = fs.readdirSync(filePathToDelete);
            const filteredFolderFiles = folderFiles.filter(ff => ff === fd.fileName);
            if(dateParts[0] === dayWeekAgo) {
                filePathToDelete = `./uploads/userFiles/${fd.senderId}/${filteredFolderFiles[0]}`;
                const indexOfObj = indexOf(fd);
                fileData.splice(indexOfObj, 1);
                fs.unlinkSync(filePathToDelete);                
            }
        });
        jsonfile.writeFile(jsonFilePath, fileData, { spaces: 2, finalEOL: true, EOL: '\r\n'}, err => {
            if(err) {
                console.log(`error while writing json file ${err}`);                
            }
        });
    });
}

export default {deleteUserFilesOverWeekOld}