var express = require('express');
const cheerio = require('cheerio');
const request = require('request');
var router = express.Router();

// Define lists of skill badges and regular badges
const skillBadges = [
  "Get Started with TensorFlow on Google Cloud",
  "Build LookML Objects in Looker",
  "Detect Manufacturing Defects using Visual Inspection AI",
  "Analyze Speech and Language with Google APIs",
  "Analyze Images with the Cloud Vision API",
  "Analyze Sentiment with Natural Language API",
  "Predict Soccer Match Outcomes with BigQuery ML",
  "Create and Manage AlloyDB Databases",
  "Manage PostgreSQL Databases on Cloud SQL",
  "Monitor and Manage Google Cloud Resources",
  "Manage Kubernetes in Google Cloud",
  "Automating Infrastructure on Google Cloud with Terraform"
];

const regularBadges = [
  "Baseline: Data, ML, AI",
  "Intro to ML: Language Processing",
  "Intro to ML: Image Processing",
  "Generative AI Explorer - Vertex AI",
  "Google Cloud Computing Foundations: Data, ML, and AI in Google Cloud",
  "Managing Machine Learning Projects with Google Cloud",
  "Introduction to AI and Machine Learning on Google Cloud",
  "Applying Machine Learning to your Data with Google Cloud",
  "Production Machine Learning Systems",
  "Smart Analytics, Machine Learning, and AI on Google Cloud",
  "ML Pipelines on Google Cloud",
  "Baseline: Infrastructure",
  "Google Cloud Computing Foundations: Infrastructure in Google Cloud - Locales",
  "Securing your Network with Cloud Armor",
  "Google Cloud Computing Foundations: Networking & Security in Google Cloud",
  "Mitigating Security Vulnerabilities on Google Cloud"
];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Return result */
router.post('/result', function (req, res, next) {
  const url = req.body.url;

  // Phân tích URL để trích xuất id
  const uuid = url.split('/').pop();

  // Chuyển hướng đến /result/<uuid>
  res.redirect('/r/' + uuid);
});

/* Return result */
router.get('/r/:id', function (req, res, next) {

  const id = req.params.id;
  const url = `https://www.cloudskillsboost.google/public_profiles/${id}`;

  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);

      // Initialize counters for skill badges and regular badges
      let skillBadgeCount = 0;
      let regularBadgeCount = 0;

      let profileName = $('.ql-display-small').text().trim();

      // Iterate through each profile badge
      $('.profile-badge').each((index, badge) => {
        // Extract badge title text
        const badgeTitle = $(badge).find('.ql-title-medium').text().trim();
        // Extract badge date
        const badgeDateText = $(badge).find('.ql-body-medium').text().trim();
        // Extract date from text
        const badgeDateMatch = badgeDateText.match(/(\w{3})\s(\d{1,2}),\s(\d{4})/);
        if (badgeDateMatch) {
          // Convert date components to Date object
          const badgeDate = new Date(`${badgeDateMatch[3]}-${badgeDateMatch[2]}-${badgeDateMatch[1]}`);
          // Check if date is within the valid range
          const startDate = new Date('2024-03-22');
          const endDate = new Date('2024-04-20');
          if (badgeDate >= startDate && badgeDate <= endDate) {
            // Compare badge title with skill badges list
            if (skillBadges.includes(badgeTitle)) {
              skillBadgeCount++;
            }
            // Compare badge title with regular badges list
            else if (regularBadges.includes(badgeTitle)) {
              regularBadgeCount++;
            }
          }
        }
      });

      const totalBadges = skillBadgeCount + regularBadgeCount

      // Determine the reward based on the number of badges earned
      let rewardMessage = "Bạn cần hoàn thành ít nhất 3 skill badges và 7 regular badges để nhận quà tặng!";

      if (skillBadgeCount >= 3 && totalBadges >= 7) {
        rewardMessage = "Bạn đã được quà Tier 1: Gối tựa, ly nước và Áo khoác gió";
      }

      if (skillBadgeCount >= 6 && totalBadges >= 14) {
        rewardMessage = "Bạn đã được quà Tier 2: Gối tựa, ly nước, và Áo khoác gió";
      }

      if (skillBadgeCount >= 3) {
        rewardMessage = `Bạn đã có ít nhất 3 skill badges. Hãy tiếp tục kiếm thêm regular badges để nhận quà tặng!`;
      }

      if (skillBadgeCount >= 6) {
        rewardMessage = "Bạn đã có ít nhất 6 skill badges. Hãy tiếp tục kiếm thêm regular badges để nhận quà tặng!";
      }

      // Send the reward message as response
      res.render('result', { rewardMessage, skillBadgeCount, regularBadgeCount, totalBadges, profileName });
    } else {
      res.send('Đã có lỗi xảy ra khi đọc HTML từ URL.');
    }
  });
});

module.exports = router;
