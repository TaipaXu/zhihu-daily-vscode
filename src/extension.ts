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
import { TopStoriesTreeDataProvider } from './tree/topStoriesTree';
import { generateHtml } from './webview/generator';

const postInitMessage = (panel: vscode.WebviewPanel): void => {
    panel.webview.postMessage({
        type: 'init',
    });
};

export const activate = (context: vscode.ExtensionContext): void => {
    const topStoriesDataProvider: TopStoriesTreeDataProvider = new TopStoriesTreeDataProvider();
    const newsDataProvider: NewsTreeDataProvider = new NewsTreeDataProvider();
    const topStoriesTreeDataProvider = vscode.window.registerTreeDataProvider(
        'zhihuDailyTopStories',
        topStoriesDataProvider,
    );
    const treeDataProvider = vscode.window.registerTreeDataProvider(
        'zhihuDailyContent',
        newsDataProvider,
    );

    let webviewPanel: vscode.WebviewPanel | undefined;
    let webviewRequestVersion = 0;
    let webviewRequest:
        | {
              controller: AbortController;
              version: number;
          }
        | undefined;

    const abortWebviewRequest = (): void => {
        if (!webviewRequest) {
            return;
        }

        webviewRequest.controller.abort();
        webviewRequest = undefined;
    };

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
                abortWebviewRequest();
                webviewPanel = undefined;
            });
        }

        return webviewPanel;
    };

    const showWebview = async (
        type: 'news' | 'longComments' | 'shortComments',
        item: unknown,
    ): Promise<void> => {
        abortWebviewRequest();

        const panel = getWebviewPanel();
        const controller = new AbortController();
        const version = ++webviewRequestVersion;
        webviewRequest = {
            controller,
            version,
        };

        try {
            const html = await generateHtml(context, type, item, controller.signal);
            if (
                controller.signal.aborted ||
                webviewRequest?.version !== version ||
                webviewPanel !== panel
            ) {
                return;
            }

            panel.webview.html = html;
        } catch (error) {
            if (!controller.signal.aborted) {
                throw error;
            }
            return;
        } finally {
            if (webviewRequest?.version === version) {
                webviewRequest = undefined;
            }
        }

        panel.reveal(panel.viewColumn ?? vscode.ViewColumn.One);
        postInitMessage(panel);
    };

    context.subscriptions.push(
        topStoriesTreeDataProvider,
        treeDataProvider,
        vscode.commands.registerCommand('zhihuDaily.topStoriesRefresh', () => {
            topStoriesDataProvider.refresh();
        }),
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
