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

import path from 'path';
import fs from 'fs';
import * as vscode from 'vscode';
import * as newsApi from '../api/news';
import * as commentApi from '../api/comment';
import { formatDateTime } from '../date';

type WebviewType = 'news' | 'longComments' | 'shortComments';

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const escapeHtml = (value: string | number | boolean | null | undefined): string => {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const getWebviewHtml = (context: vscode.ExtensionContext): string => {
    const resourcePath = path.join(context.extensionPath, 'static/web/index.html');
    return fs.readFileSync(resourcePath, 'utf-8');
};

const getCommentTemplate = (context: vscode.ExtensionContext): string => {
    const resourcePath = path.join(context.extensionPath, 'static/web/comment_card.html');
    return fs.readFileSync(resourcePath, 'utf-8');
};

const getCommandPayload = (data: unknown): unknown => {
    if (!isRecord(data) || !isRecord(data.command)) {
        return data;
    }

    const args = data.command.arguments;
    return Array.isArray(args) ? (args[0] ?? data) : data;
};

const getStoryId = (data: unknown): number => {
    const payload = getCommandPayload(data);
    if (!isRecord(payload)) {
        throw new Error('数据格式异常');
    }

    const id = payload.id;
    if (typeof id === 'number' && Number.isFinite(id)) {
        return id;
    }

    if (typeof id === 'string' && id.length > 0) {
        const numericId = Number(id);
        if (Number.isFinite(numericId)) {
            return numericId;
        }
    }

    throw new Error('数据格式异常');
};

const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : '网络错误';
};

const renderMessage = (message: string): string => {
    return `<p>${escapeHtml(message)}</p>`;
};

const renderComments = (
    comments: commentApi.ZhihuComment[] | undefined,
    template: string,
): string => {
    if (!Array.isArray(comments) || comments.length === 0) {
        return renderMessage('暂无评论');
    }

    return comments
        .map((element) => {
            return template
                .replace('${authorName}', escapeHtml(element.author))
                .replace('${content}', element.content)
                .replace('${datetime}', formatDateTime(new Date(element.time * 1000)));
        })
        .join('');
};

export const generateHtml = async (
    context: vscode.ExtensionContext,
    type: WebviewType,
    data: unknown,
): Promise<string> => {
    const html = getWebviewHtml(context);

    try {
        if (type === 'news') {
            const response = await newsApi.getNewsDetail(getStoryId(data));
            return html.replace('${content}', response.data.body);
        }

        const storyId = getStoryId(data);
        const response =
            type === 'longComments'
                ? await commentApi.getLongComments(storyId)
                : await commentApi.getShortComments(storyId);
        const content = renderComments(response.data.comments, getCommentTemplate(context));
        return html.replace('${content}', content);
    } catch (error) {
        vscode.window.showWarningMessage(getErrorMessage(error));
        return html.replace('${content}', renderMessage('加载失败'));
    }
};
