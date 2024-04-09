var express = require('express');
const cheerio = require('cheerio');
const moment = require('moment');
const request = require('request');
var router = express.Router();

const csv = require('csv-parser');
const fs = require('fs');

moment.locale('vi');

// Define lists of skill badges and regular badges
var baseBadges = [], skillBadges = [], regularBadges = [];

// Load badges from csv;
fs.createReadStream('./data/gsp-badges.csv').pipe(csv())
  .on('data', (data) => baseBadges.push(data))
  .on('end', () => {
    baseBadges.forEach(badge => {
      switch (badge.type) {
        case 'SKILL':
          skillBadges.push(badge.name);
          break;
        case 'REGULAR':
          regularBadges.push(badge.name);
          break;
        default:
          break;
      }
    });
  });

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    app: {
      title: 'QuanQuanGSP Checker',
      description: 'QuanQuanGSP Checker',
      image: 'https://us.v-cdn.net/5021068/uploads/editor/ha/7frj09nru4zu.png'
    }
  });
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
      let profileAvatar = $('ql-avatar.profile-avatar').attr('src');
      let profileId = id;

      if (!profileName) {
        return res.redirect('/'); // Redirect to homepage
      }

      const badgesWrong = [];
      const badgesWrongTime = [];

      // Iterate through each profile badge
      $('.profile-badge').each((index, badge) => {
        // Extract badge title text
        const badgeTitle = $(badge).find('.ql-title-medium').text().trim();
        // Extract badge date
        const badgeDateText = $(badge).find('.ql-body-medium').text().trim();

        // Extract date from text
        const badgeDateMatch = badgeDateText.match(/(\w{3})\s+(\d{1,2}),\s+(\d{4})/);
        if (badgeDateMatch) {
          // Convert date components to Date object
          const badgeDate = new Date(`${badgeDateMatch[3]}-${badgeDateMatch[2]}-${badgeDateMatch[1]}T00:00:00-0400`);
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
      let isCompleted = false;

      if (skillBadgeCount >= 3 && totalBadges >= 7) {
        rewardMessage = "🎊 Bạn đã được quà Tier 1: Gối tựa, ly nước";
        isCompleted = true;
      }

      if (skillBadgeCount >= 6 && totalBadges >= 14) {
        rewardMessage = "🎉 Bạn đã được quà Tier 2: Gối tựa, ly nước, và Áo khoác gió";
        isCompleted = true;
      }

      if (skillBadgeCount >= 3 && totalBadges < 7) {
        rewardMessage = `Bạn đã có ít nhất 3 skill badges. Hãy tiếp tục kiếm thêm regular badges để nhận quà tặng!`;
        isCompleted = false;
      }

      if (skillBadgeCount >= 6 && totalBadges < 14) {
        rewardMessage = "Bạn đã có ít nhất 6 skill badges. Hãy tiếp tục kiếm thêm regular badges để nhận quà tặng!";
        isCompleted = false;
      }

      console.log(`USER: ${profileName}, ID: ${id}, SKILL BADGES: ${skillBadgeCount}, REGULAR BADGES: ${regularBadgeCount}, TOTAL BADGES: ${totalBadges}`);

      const app = {
        title: profileName,
        description: `${profileName} - ${rewardMessage}`,
        image: profileAvatar
      }

      // Send the reward message as response
      res.render('result', { app, rewardMessage, skillBadgeCount, regularBadgeCount, totalBadges, profileId, profileName, profileAvatar, isCompleted });
    } else {
      res.send('Đã có lỗi xảy ra khi đọc HTML từ URL.');
    }
  });
});

/* Return result */
router.get('/r/:id/view', function (req, res, next) {

  const uuid = req.params.id;
  const url = `https://www.cloudskillsboost.google/public_profiles/${uuid}`;

  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);

      // Initialize counters for skill badges and regular badges
      let skillBadgeCount = 0;
      let regularBadgeCount = 0;
      let badgesOfUser = [...baseBadges];

      let profileName = $('.ql-display-small').text().trim();
      let profileAvatar = $('ql-avatar.profile-avatar').attr('src');
      let profileId = uuid;

      if (!profileName) {
        return res.redirect('/'); // Redirect to homepage
      }

      // Iterate through each profile badge
      $('.profile-badge').each((index, badge) => {
        // Extract badge title text
        const badgeTitle = $(badge).find('.ql-title-medium').text().trim();
        // Extract badge date
        const badgeDateText = $(badge).find('.ql-body-medium').text().trim();

        // Extract date from text
        const badgeDateMatch = badgeDateText.match(/(\w{3})\s+(\d{1,2}),\s+(\d{4})/);
        if (badgeDateMatch) {
          // Convert date components to Date object
          const badgeDate = new Date(`${badgeDateMatch[3]}-${badgeDateMatch[2]}-${badgeDateMatch[1]}T00:00:00-0400`);

          let badgeExists = false;

          badgesOfUser = badgesOfUser.map(badge => {
            if (badge.name === badgeTitle) {
              badgeExists = true;
              return {
                ...badge,
                time_completed: badgeDate,
                time_completed_str: moment(badgeDate, "YYYY-MM-DDTHH:MM:SSZ").fromNow(),
                time_completed_hint: moment(badgeDate, "YYYY-MM-DDTHH:MM:SSZ").format('MM/DD/YYYY'),
                badge_status: 'OK'
              };
            } else {
              return badge;
            }
          });

          if (!badgeExists) {
            badgesOfUser.push({
              name: badgeTitle,
              time_completed: badgeDate,
              time_completed_str: moment(badgeDate, "YYYY-MM-DDTHH:MM:SSZ").fromNow(),
              time_completed_hint: moment(badgeDate, "YYYY-MM-DDTHH:MM:SSZ").format('MM/DD/YYYY'),
              badge_status: 'NOT_IN_SS6'
            });
          }

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

          } else {
            badgesOfUser = badgesOfUser.map(badge => {
              if (badge.name === badgeTitle) {
                return {
                  ...badge,
                  badge_status: 'TIME_NOT_OK'
                };
              } else {
                return badge;
              }
            });
          }
        }
      });

      const totalBadges = skillBadgeCount + regularBadgeCount

      // Determine the reward based on the number of badges earned
      let rewardMessage = "Bạn cần hoàn thành ít nhất 3 skill badges và 7 regular badges để nhận quà tặng!";
      let isCompleted = false;

      if (skillBadgeCount >= 3 && totalBadges >= 7) {
        rewardMessage = "🎊 Bạn đã được quà Tier 1: Gối tựa, ly nước";
        isCompleted = true;
      }

      if (skillBadgeCount >= 6 && totalBadges >= 14) {
        rewardMessage = "🎉 Bạn đã được quà Tier 2: Gối tựa, ly nước, và Áo khoác gió";
        isCompleted = true;
      }

      if (skillBadgeCount >= 3 && totalBadges < 7) {
        rewardMessage = `Bạn đã có ít nhất 3 skill badges. Hãy tiếp tục kiếm thêm regular badges để nhận quà tặng!`;
        isCompleted = false;
      }

      if (skillBadgeCount >= 6 && totalBadges < 14) {
        rewardMessage = "Bạn đã có ít nhất 6 skill badges. Hãy tiếp tục kiếm thêm regular badges để nhận quà tặng!";
        isCompleted = false;
      }

      console.log(`USER: ${profileName}, ID: ${uuid}, SKILL BADGES: ${skillBadgeCount}, REGULAR BADGES: ${regularBadgeCount}, TOTAL BADGES: ${totalBadges}`);

      const app = {
        title: profileName,
        description: `${profileName} | Danh sách khóa học`,
        image: profileAvatar
      }

      badgesOfUser = badgesOfUser.sort((a, b) => {

        if (a.badge_status == 'NOT_COMPLETE' && b.badge_status == 'NOT_COMPLETE') {
          return b.duration_complete - a.duration_complete;
        }

        if (a.time_completed == '-' || b.time_completed == '-') {
          return a.badge_status.length - b.badge_status.length;
        }

        const timeA = moment(a.time_completed, "YYYY-MM-DDTHH:mm:ssZ");
        const timeB = moment(b.time_completed, "YYYY-MM-DDTHH:mm:ssZ");

        return timeA.diff(timeB);
      })

      // Send the reward message as response
      res.render('result-detail', { app, rewardMessage, skillBadgeCount, regularBadgeCount, badgesOfUser, totalBadges, profileId, profileName, profileAvatar, isCompleted });
    } else {
      res.send('Đã có lỗi xảy ra khi đọc HTML từ URL.');
    }
  });
});

module.exports = router;
