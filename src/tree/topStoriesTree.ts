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

import { AbstractTreeDataProvider, Node } from './abstractTree';
import * as newsApi from '../api/news';
import { formatDate, getDateBefore } from '../date';
import { createStoryNode } from './storyNode';

export class TopStoriesTreeDataProvider extends AbstractTreeDataProvider {
    public refresh(): void {
        this.clearCache();
        this.fireChange();
    }

    protected getCacheKey(): string {
        return 'top-stories';
    }

    protected getLoadingMessage(): string {
        return `Loading ${this.getCurrentDateLabel()}`;
    }

    protected getLoadedMessage(): string {
        return this.getCurrentDateLabel();
    }

    private getCurrentDateLabel(): string {
        return formatDate(getDateBefore(0));
    }

    protected async getItems(signal: AbortSignal): Promise<Node[]> {
        const response = await newsApi.getNews(1, signal);
        const topStories = response.data.top_stories;
        if (!Array.isArray(topStories)) {
            throw new Error('数据格式异常');
        }

        const stories = Array.isArray(response.data.stories) ? response.data.stories : [];
        const storiesById = new Map(stories.map((story) => [story.id, story]));

        return topStories.map((story) => {
            const dailyStory = storiesById.get(story.id);
            const tooltipStory = dailyStory
                ? {
                      ...story,
                      hint: dailyStory.hint ?? story.hint,
                      image: dailyStory.images?.[0] ?? dailyStory.image ?? story.image,
                      images: dailyStory.images ?? story.images,
                  }
                : story;

            return createStoryNode(story, tooltipStory);
        });
    }
}
