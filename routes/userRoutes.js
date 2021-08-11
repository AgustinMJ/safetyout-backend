const express = require('express');
const { body } = require('express-validator');


const userController = require('../controllers/userController');
const router = express.Router();

const shortid = require("shortid");
  const multer = require("multer");
  const multerS3 = require("multer-s3");
  const aws = require("aws-sdk");

  const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY
  })


  const uploadS3 = multer({
    storage: multerS3({
      s3: s3,
      bucket: "safetyout",
      acl: "public-read",
      metadata: function(req, file, cb){
        cb(null, {fieldName: 'profileImage'});
      },
      key: function (req, file, cb) {
        cb(null, shortid.generate() + "-" + shortid.generate() + '.png');
      },
    })
  }).single('profileImage');


router.post('/signup', userController.signUp);
router.post('/login', userController.logIn);
router.get('/', userController.getUserId);
router.get('/:id', userController.getUserInfo);
router.get('/:id/friends', userController.getUserFriends);
router.get('/checkEmail/:email', userController.checkEmail);

router.get('/:id/trophies', userController.getTrophies);

router.get('/:id/bubbles', userController.getUserBubbles);
router.get('/:id/friendRequests', userController.getUserFriendRequests);
router.get('/:id/bubbleInvitations', userController.getUserBubbleInvitations);
router.post('/loginTerceros', userController.logInTerceros);


router.delete('/:id', userController.deleteAccount);
router.delete('/:id/friends/:friendId', userController.deleteFriend)
router.get('/:id/chats', userController.getUserChats);

router.patch('/:id', uploadS3 ,userController.changeUserInfo);


module.exports = router;