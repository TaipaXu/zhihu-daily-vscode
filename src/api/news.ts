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
import request, { type RequestResponse } from '../request';
import { formatApiDate, formatDate, getDateBefore } from '../date';

export interface ZhihuNewsStory {
    id: number;
    title: string;
    [key: string]: unknown;
}

export interface ZhihuNewsListResponse {
    stories: ZhihuNewsStory[];
    [key: string]: unknown;
}

export interface ZhihuNewsDetailResponse {
    body: string;
    [key: string]: unknown;
}

export const getNews = async (
    page: number,
    signal?: AbortSignal,
): Promise<RequestResponse<ZhihuNewsListResponse>> => {
    let url: string;
    if (page === 1) {
        url = 'news/latest';
    } else {
        url = `news/before/${formatApiDate(getDateBefore(page - 2))}`;
    }
    vscode.window.setStatusBarMessage(formatDate(getDateBefore(page - 1)));

    return await request<ZhihuNewsListResponse>({
        url,
        method: 'GET',
        signal,
    });
};

export const getNewsDetail = async (
    id: number,
    signal?: AbortSignal,
): Promise<RequestResponse<ZhihuNewsDetailResponse>> => {
    return await request<ZhihuNewsDetailResponse>({
        url: `news/${id}`,
        method: 'GET',
        signal,
    });
};
