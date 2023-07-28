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

import * as vscode from 'vscode';
import { NewsTreeDataProvider } from './tree/newsTree';
import { generateHtml } from './webview/generator';

export function activate(context: vscode.ExtensionContext) {
    const newsDataProvider: NewsTreeDataProvider = new NewsTreeDataProvider();
    vscode.window.registerTreeDataProvider('zhihuDailyContent', newsDataProvider);

    let webviewOpened: Boolean = false;
    let webviewPanel: vscode.WebviewPanel;

    function checkWebviewPanel(): void {
        if (!webviewOpened) {
            webviewPanel = vscode.window.createWebviewPanel(
                'ZhiHu Daily',
                'ZhiHu Daily',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );
            webviewOpened = true;
            webviewPanel.onDidDispose(() => {
                webviewOpened = false;
            });
        }
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('zhihuDaily.previous', (item: any) => {
            newsDataProvider.prevPage();
        }),
        vscode.commands.registerCommand('zhihuDaily.next', (item: any) => {
            newsDataProvider.nextPage();
        }),
        vscode.commands.registerCommand('zhihuDaily.refresh', (item: any) => {
            newsDataProvider.refresh();
        }),
        vscode.commands.registerCommand('zhihuDaily.select', async (item: any) => {
            checkWebviewPanel();
            let html: string = await generateHtml(context, 'news', item);
            webviewPanel.webview.html = html;
            webviewPanel.webview.postMessage({
                "type": "init",
            });
        }),
        vscode.commands.registerCommand('zhihuDaily.longComments', async (item: any) => {
            checkWebviewPanel();
            let html: string = await generateHtml(context, 'longComments', item);
            webviewPanel.webview.html = html;
            webviewPanel.webview.postMessage({
                "type": "init",
            });
        }),
        vscode.commands.registerCommand('zhihuDaily.shortComments', async (item: any) => {
            checkWebviewPanel();
            let html: string = await generateHtml(context, 'shortComments', item);
            webviewPanel.webview.html = html;
            webviewPanel.webview.postMessage({
                "type": "init",
            });
        }),
    );
}

export function deactivate() { }
