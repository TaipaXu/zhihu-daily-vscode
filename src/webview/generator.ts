/*
 * GNU General Public License, Version 3.0
 *
 * Copyright (c) 2019 Taipa Xu
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const path = require('path');
const fs = require('fs');
import * as dayjs from 'dayjs';
import * as vscode from 'vscode';
import * as newsApi from '../api/news';
import * as commentApi from '../api/comment';

export async function generateHtml(context: vscode.ExtensionContext, type: string, data: any): Promise<string> {
    const resourcePath: string = path.join(context.extensionPath, 'static/web/index.html');
    let html: string = fs.readFileSync(resourcePath, 'utf-8');
    if (type === 'news') {
        try {
            let response: any = await newsApi.getNewsDetail(data.id);
            html = html.replace('${content}', response.data.body);
        } catch (error) {

        }
    } else if (type === 'longComments') {
        try {
            let response: any = await commentApi.getLongComments(data.command.arguments[0].id);
            let comments = response.data.comments;
            const resourcePath: string = path.join(context.extensionPath, 'static/web/comment_card.html');
            let content: string = '';
            let comment: string = fs.readFileSync(resourcePath, 'utf-8');
            comments.forEach((element: any) => {
                let item: string = comment
                    .replace('${authorName}', element.author)
                    .replace('${content}', element.content)
                    .replace('${datetime}', dayjs(element.time * 1000).format('YYYY-MM-DD HH:mm:ss'));
                content += item;
            });
            html = html.replace('${content}', content);
        } catch (error) {

        }
    } else if (type === 'shortComments') {
        try {
            let response: any = await commentApi.getShortComments(data.command.arguments[0].id);
            let comments = response.data.comments;
            const resourcePath: string = path.join(context.extensionPath, 'static/web/comment_card.html');
            let content: string = '';
            let comment: string = fs.readFileSync(resourcePath, 'utf-8');
            comments.forEach((element: any) => {
                let item: string = comment
                    .replace('${authorName}', element.author)
                    .replace('${content}', element.content)
                    .replace('${datetime}', dayjs(element.time * 1000).format('YYYY-MM-DD HH:mm:ss'));
                content += item;
            });
            html = html.replace('${content}', content);
        } catch (error) {

        }
    }
    return html;
}
