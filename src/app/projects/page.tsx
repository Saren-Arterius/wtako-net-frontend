"use client";

import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import { ContentPageHeader } from "@/components/ContentPageHeader";
import { githubStarsStore } from "@/store/GithubStarsStore";
import { ProjectItemComponent } from "@/components/ProjectItemComponent";

const filterOptions = [
  { key: "ALL", label: "All Projects" },
  { key: "ACTIVE", label: "Active" },
  { key: "WIP", label: "In Development" },
  { key: "ARCHIVED", label: "Archived" },
] as const;

export const ProjectsList = observer(() => {
  const projects = store.projects;

  const [sortByLatest, setSortByLatest] = useState(false);

  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let defaultFilter = 'ALL';
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlFilter = searchParams.get("filter");
      defaultFilter = (filterOptions.find(o => o.key === urlFilter) ? urlFilter : "ALL") || 'ALL';
    }
    if (defaultFilter !== filter) {
      setFilter(defaultFilter);
    }
  }, []);

  const updateFilter = (newFilter: string) => {
    setFilter(newFilter);
    const url = new URL(window.location.href);
    if (newFilter === "ALL") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", newFilter);
    }
    if (url.href !== window.location.href) window.history.pushState({}, '', url.toString());
  };

  const filteredProjects = projects.filter((item) =>
    filter === "ALL" ? true : item.status === filter
  );

  const sortedProjects = sortByLatest ? store.projectsLatest : filteredProjects;

  useEffect(() => {
    const urls = projects.map(p => p.url);
    githubStarsStore.fetchStarsBatch(urls);
  }, [projects]);

  return (
    <div className="space-y-6">
      <ContentPageHeader
        title={'Coding Projects'}
        subtitle={'Things I build and maintain'}
        filterOptions={filterOptions}
        filterKey={filter}
        onFilterChange={updateFilter}
        sortByLatest={sortByLatest}
        onSortToggle={() => setSortByLatest(!sortByLatest)}
      />

      <div className="space-y-4">
        {sortedProjects.map((project, index) => (
          <ProjectItemComponent key={index} project={project} />
        ))}
      </div>

      {sortedProjects.length === 0 && (
        <div className="text-center py-16">
          <p className="text-subtitle text-lg">{store.t('No projects found.')}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-subtitle text-sm mb-4">{store.t('Find more of my projects at:')}</p>
        <a
          href="https://github.com/Saren-Arterius/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:text-highlight text-sm inline-flex items-center gap-2"
        >
          {store.t('GitHub')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
});


export default function ProjectsPage() {
  return (
    <Layout>
      <ProjectsList />
    </Layout>
  );
}
