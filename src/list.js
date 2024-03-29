/**
 * This preview generator is used to generate the preview for the list of
 * Run script: node list.js
 */

const fs = require('fs');

const sizeList = [16, 24, 32, 48, 64, 128],
    baseRepoAddress = 'https://raw.githubusercontent.com/EgoistDeveloper/operating-system-logos/master',
    previewSize = '48x48';

/**
 * Update readme preview list
 * 
 * @param {string} newData 
 */
function updateList(newData) {
    fs.readFile('./../README.md', 'utf8', (err, data) => {
        if (err) {
            console.error(err);

            return;
        }

        if (data) {
            const match = data.match('<!-- TABLE_START -->((.|\n|\s|\r)*)<!-- TABLE_END -->');

            if (match && match[1]) {
                data = data.replace(match[1], `\n\n${newData}\n`);

                new Promise(function (resolve, reject) {
                    fs.writeFile('./../README.md', data, 'utf8', function (err) {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });
            }
        }
    });
}

function copyWithSlug(osCode, osName) {
    const slug = osName.toLowerCase().replace(/ /g,'-').replace(/[-]+/g, '-').replace(/[^\w-]+/g,'');

    const slugItem = {
        code: osCode,
        name: osName,
        slug: slug
    };

    return slugItem;
}

try {
    let osList = JSON.parse(fs.readFileSync('alpha3-list.json')),
        tableMarkdown = `| Preview | Code | Name | Status |\n| ------- | ---- | ---- | ------ |\n`,
        availableItems = 0,
        slugList = [];

    osList = Object.entries(osList);

    osList.forEach(osItem => {
        const osCode = osItem[0],
            osName = osItem[1];

        let logoStackCount = 0,
            missingSizes = [];

        // count exists and missing images for target logo
        sizeList.forEach(size => {
            let logoPath = `${size}x${size}/${osCode}.png`;

            if (fs.existsSync(logoPath)) {
                logoStackCount += 1;
            } else {
                missingSizes.push(size);
            }
        });

        //#region markdown print

        if (logoStackCount == 0) {
            tableMarkdown += `| ............ | ${osCode} | ${osName} | ❌ |\n`;

            console.log(`❌ ${osName} (${osCode}): all logos not found.\n--------------------------`);
        } else if (logoStackCount == sizeList.length) {
            tableMarkdown += `| ![](${baseRepoAddress}/src/${previewSize}/${osCode}.png "${osCode} (${previewSize})") | ${osCode} | ${osName} | ✅ |\n`;

            slugList.push(copyWithSlug(osCode, osName));

            availableItems += 1;
        } else if (logoStackCount > 0 && logoStackCount < sizeList.length) {
            tableMarkdown += `| ............ | ${osCode} | ${osName} | ⭕ |\n`;

            console.log(`⭕ ${osName} (${osCode}): ${sizeList.length - logoStackCount} logos missing (sizes: ${missingSizes.join(', ')})\n--------------------------`);
        }

        //#endregion
    });

    const totalStatistics = `⚠️ Total: ${osList.length}, Available: ${availableItems}, Unavailable: ${osList.length - availableItems}`;

    console.log(`\n${totalStatistics}\n\n`);

    updateList(`${totalStatistics}\n\n${tableMarkdown}`);

    if (slugList) {
        fs.writeFile('./os-list.json', JSON.stringify(slugList, null, 2), function (err) {
            if (err) throw err;

            console.log('slug-list.json updated!');
        });
    }
} catch (err) {
    console.log(err.toString());
}