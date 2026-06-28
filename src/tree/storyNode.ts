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
import * as newsApi from '../api/news';
import { Node } from './abstractTree';

const getText = (value: unknown): string | undefined => {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const getStoryImage = (story: newsApi.ZhihuNewsStory): string | undefined => {
    return story.image ?? story.images?.[0];
};

const createStoryTooltip = (story: newsApi.ZhihuNewsStory): vscode.MarkdownString => {
    const tooltip = new vscode.MarkdownString('', true);
    const image = getStoryImage(story);
    const hint = getText(story.hint);

    tooltip.appendText(story.title);

    if (hint) {
        tooltip.appendMarkdown('\n\n');
        tooltip.appendText(hint);
    }

    if (image) {
        tooltip.appendMarkdown(`\n\n![封面](${image})`);
    }

    return tooltip;
};

export const createStoryNode = (
    story: newsApi.ZhihuNewsStory,
    tooltipStory: newsApi.ZhihuNewsStory = story,
): Node => {
    const node = new Node(story.title, vscode.TreeItemCollapsibleState.None, {
        command: 'zhihuDaily.select',
        title: '',
        arguments: [story],
    });
    node.contextValue = 'story';
    node.tooltip = createStoryTooltip(tooltipStory);
    return node;
};
