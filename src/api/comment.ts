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

import request, { type RequestResponse } from '../request';

export interface ZhihuComment {
    author: string;
    content: string;
    time: number;
    [key: string]: unknown;
}

export interface ZhihuCommentResponse {
    comments: ZhihuComment[];
    [key: string]: unknown;
}

export const getLongComments = async (
    id: number,
    signal?: AbortSignal,
): Promise<RequestResponse<ZhihuCommentResponse>> => {
    return await request<ZhihuCommentResponse>({
        url: `story/${id}/long-comments`,
        method: 'GET',
        signal,
    });
};

export const getShortComments = async (
    id: number,
    signal?: AbortSignal,
): Promise<RequestResponse<ZhihuCommentResponse>> => {
    return await request<ZhihuCommentResponse>({
        url: `story/${id}/short-comments`,
        method: 'GET',
        signal,
    });
};
