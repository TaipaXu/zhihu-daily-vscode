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

const postInitMessage = (panel: vscode.WebviewPanel): void => {
    panel.webview.postMessage({
        type: 'init',
    });
};

export const activate = (context: vscode.ExtensionContext): void => {
    const newsDataProvider: NewsTreeDataProvider = new NewsTreeDataProvider();
    const treeDataProvider = vscode.window.registerTreeDataProvider(
        'zhihuDailyContent',
        newsDataProvider,
    );

    let webviewPanel: vscode.WebviewPanel | undefined;

    const getWebviewPanel = (): vscode.WebviewPanel => {
        if (!webviewPanel) {
            webviewPanel = vscode.window.createWebviewPanel(
                'ZhiHu Daily',
                'ZhiHu Daily',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                },
            );
            webviewPanel.onDidDispose(() => {
                webviewPanel = undefined;
            });
        }

        return webviewPanel;
    };

    const showWebview = async (
        type: 'news' | 'longComments' | 'shortComments',
        item: unknown,
    ): Promise<void> => {
        const panel = getWebviewPanel();
        panel.webview.html = await generateHtml(context, type, item);
        panel.reveal(panel.viewColumn ?? vscode.ViewColumn.One);
        postInitMessage(panel);
    };

    context.subscriptions.push(
        treeDataProvider,
        vscode.commands.registerCommand('zhihuDaily.previous', () => {
            newsDataProvider.prevPage();
        }),
        vscode.commands.registerCommand('zhihuDaily.next', () => {
            newsDataProvider.nextPage();
        }),
        vscode.commands.registerCommand('zhihuDaily.refresh', () => {
            newsDataProvider.refresh();
        }),
        vscode.commands.registerCommand('zhihuDaily.select', async (item: unknown) => {
            await showWebview('news', item);
        }),
        vscode.commands.registerCommand('zhihuDaily.longComments', async (item: unknown) => {
            await showWebview('longComments', item);
        }),
        vscode.commands.registerCommand('zhihuDaily.shortComments', async (item: unknown) => {
            await showWebview('shortComments', item);
        }),
    );
};

export const deactivate = (): void => {};
