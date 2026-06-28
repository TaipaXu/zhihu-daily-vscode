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

type WebviewType = 'news' | 'longComments' | 'shortComments';
type WebviewKind = 'content' | 'comments';

interface WebviewState {
    panel?: vscode.WebviewPanel;
    requestVersion: number;
    request?:
        | {
              controller: AbortController;
              version: number;
          }
        | undefined;
}

const postInitMessage = (panel: vscode.WebviewPanel): void => {
    panel.webview.postMessage({
        type: 'init',
    });
};

const getWebviewKind = (type: WebviewType): WebviewKind => {
    return type === 'news' ? 'content' : 'comments';
};

const getWebviewTitle = (kind: WebviewKind): string => {
    return kind === 'content' ? '知乎日报内容' : '知乎日报评论';
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

    const webviews: Record<WebviewKind, WebviewState> = {
        content: {
            requestVersion: 0,
        },
        comments: {
            requestVersion: 0,
        },
    };

    const abortWebviewRequest = (state: WebviewState): void => {
        if (!state.request) {
            return;
        }

        state.request.controller.abort();
        state.request = undefined;
    };

    const getWebviewPanel = (kind: WebviewKind): vscode.WebviewPanel => {
        const state = webviews[kind];
        if (!state.panel) {
            const panel = vscode.window.createWebviewPanel(
                `zhihuDaily.${kind}`,
                getWebviewTitle(kind),
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                },
            );
            state.panel = panel;
            panel.onDidDispose(() => {
                abortWebviewRequest(state);
                if (state.panel === panel) {
                    state.panel = undefined;
                }
            });
        }

        return state.panel;
    };

    const showWebview = async (type: WebviewType, item: unknown): Promise<void> => {
        const kind = getWebviewKind(type);
        const state = webviews[kind];
        abortWebviewRequest(state);

        const panel = getWebviewPanel(kind);
        panel.reveal(panel.viewColumn ?? vscode.ViewColumn.One);
        const controller = new AbortController();
        const version = ++state.requestVersion;
        state.request = {
            controller,
            version,
        };

        try {
            const html = await generateHtml(context, type, item, controller.signal);
            if (
                controller.signal.aborted ||
                state.request?.version !== version ||
                state.panel !== panel
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
            if (state.request?.version === version) {
                state.request = undefined;
            }
        }

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
