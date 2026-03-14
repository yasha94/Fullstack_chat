import multer from 'multer';

// const storage = multer.diskStorage(
//     {
//         destination: (req, file, cb) => {
//             if(req.url === '/users/register'){
//                 cb(null, `uploads/usersProfilePictures/${req.body.String(req.body.)}`);
//             }
//             cb(null, 'uploads/');
//         },
//         filename: (req, file, cb) => {

//         }
//     }
// );

const profilePictureMemory = multer.memoryStorage();

const filterProfilePicture = (req, file, cb) => {

    console.log(`req.body multer middleware FILE`, file);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, png, webp, gif) are allowed'));
    }
};

const uploadProfilePicture = multer({
    storage: profilePictureMemory,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: filterProfilePicture,
});

export {uploadProfilePicture};