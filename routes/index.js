
const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', {
    app: {
      title: 'QuanQuanGSP Checker',
      description: 'QuanQuanGSP Checker',
      image: 'https://us.v-cdn.net/5021068/uploads/editor/ha/7frj09nru4zu.png'
    }
  });
});

router.post('/result', function (req, res, next) {
  const url = req.body.url;

  // Phân tích URL để trích xuất id
  const uuid = url.split('/').pop();

  // Chuyển hướng đến /result/<uuid>
  res.redirect('/r/' + uuid);
});

const gcpCtrl = require('../controllers/gcp.controller');

router.get('/r/:id', gcpCtrl.viewProfile.bind(gcpCtrl));
router.get('/r/:id/view', gcpCtrl.viewProfileDetail.bind(gcpCtrl));

module.exports = router;
