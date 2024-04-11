const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const csv = require('csv-parser');

class GCPService {

    constructor() {
        this.baseBadges = [], this.skillBadges = [], this.regularBadges = [];
    }

    loadCSV() {
        fs.createReadStream('./data/gcp-badges.csv').pipe(csv())
            .on('data', (data) => this.baseBadges.push(data))
            .on('end', () => {
                this.baseBadges.forEach(badge => {
                    switch (badge.type) {
                        case 'SKILL':
                            this.skillBadges.push(badge.name);
                            break;
                        case 'REGULAR':
                            this.regularBadges.push(badge.name);
                            break;
                        default:
                            break;
                    }
                });
            });
    }

    get(url) {
        return new Promise((resolve, reject) => {
            request(url, (error, response, html) => {
                if (error || response.statusCode !== 200) {
                    reject(new Error('Đã có lỗi xảy ra khi đọc HTML từ URL.'));
                }
                resolve(cheerio.load(html))
            });
        });
    }

}

module.exports = new GCPService();