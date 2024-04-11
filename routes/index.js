
const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', {
    app: {
      title: 'QuanQuanGCP Checker',
      description: 'Google Cloud Skills Boost badge on your Google Developer profile',
      image: 'https://th.bing.com/th/id/R.789abf9bb9a30856c94e240a9f8ea2d1?rik=TwCxzFVDeUMUZA&riu=http%3a%2f%2fpluspng.com%2fimg-png%2fgoogle-developers-logo-png-event-details-2729.png&ehk=4VHK8xnI7XD9KVs0PWP3ic8GXHL9fY4%2bGFAvPbBiDmQ%3d&risl=&pid=ImgRaw&r=0'
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
