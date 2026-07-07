/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {requestUrlParser} from "./routet.js";
import {getLatestReleaseTag} from "./github.js";

export default {
  async fetch(request, env, ctx) {
    const urlParseRet = await requestUrlParser(request.url);

    if (!urlParseRet) {
      return new Response("Invalid URL", {status: 400});
    }

    const tagInfo = await getLatestReleaseTag({
      user: urlParseRet.user,
      repo: urlParseRet.repo,
    });

    if (!tagInfo) {
      return new Response("Internal Server Error", {status: 500});
    }

    /* 定义网址中允许的占位符，以及其值。 */
    const urlPlaceholders = [
      ["tag", `${tagInfo.tag}`],
      ["version", `${tagInfo.tag.replaceAll(/^v/g, "")}`],
    ];

    /**
     * 获取解码后的文件名。用来替换其中的占位符。
     * 占位符使用花括号（‘{’、‘}’）包裹，花括号会被编码。
     */
    let filename = decodeURIComponent(urlParseRet.file);

    for (const placeholder of urlPlaceholders) {
      filename = filename.replaceAll(`{${placeholder[0]}}`, placeholder[1]);
    }

    return Response.redirect(`${tagInfo.urlPrefix}/download/${tagInfo.tag}/${filename}`);
  },
};
