import createExcelFileBufferFromAssetRegisterData from "../Excel/createExcelFileFromAssetRegisterData.js";
import { getAssetDisposalReport } from "../Reports/asset_disposal.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import getUsersSubscribedToMailSubscription from "./getUsersSubscribedToMail.js";
import Mail from "./mail.js";
export default function generateDepreciatedAssetsInMonth() {
    return new Promise((res, rej) => {
        // Get dates
        const today = new Date();
        // Get date last month
        var lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        // Find assets that depreciated in this month
        getAssetDisposalReport(lastMonth, today).then(depreciatedAssets => {
            var excelfilebuffer = createExcelFileBufferFromAssetRegisterData(depreciatedAssets);
            // Send mail
            getUsersSubscribedToMailSubscription(1).then(users => {
                let emails = users.map((e) => e.email);
                const html = `
                    <p>These are the assets that have depreciated for this month</p>
                    <p>If you weren't meant to receive this email please ignore it</p>
                `;
                Mail.sendMailWithAttachmentsToMultipleRecepients(html, "Extreme Wireless Asset Management account team <account-security-noreply@mail.extremeusers.com>", emails, "Assets That Have Fully Depreciated This Month", excelfilebuffer, "fully_depreciated.xlsx").then((_) => {
                    return res();
                }).catch((err) => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_GENERATE_MONTLY_DEPRECIATED_ASSETS));
                });
            }).catch((err) => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_GENERATE_MONTLY_DEPRECIATED_ASSETS));
            });
        }).catch((err) => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_GENERATE_MONTLY_DEPRECIATED_ASSETS));
        });
    });
}
//# sourceMappingURL=generateDepreciatedAssetsMail.js.map