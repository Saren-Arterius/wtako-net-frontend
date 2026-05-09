

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Project } from "@/types";
import { githubStarsStore } from "@/store/GithubStarsStore";
import { store } from "@/store/store";
import { linkify } from "@/app/utils";
import FadeInImage from "./FadeInImage";

interface ProjectItemComponentProps {
  project: Project;
  compact?: boolean; // if true, show compact version with smaller fonts and no tags/"View Project" link
}

export const ProjectItemComponent = observer((props: ProjectItemComponentProps) => {
  const { project, compact = false } = props;

  useEffect(() => {
    githubStarsStore.fetchStarsBatch([project.url]);
  }, [project.url]);

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-status-online/80 text-white/80",
      WIP: "bg-pink-400/50 text-white",
      ARCHIVED: "bg-amber-200/20 text-link",
    };
    return colors[status];
  };

  const formatDate = (dateStr: string): string => {
    if (dateStr.length === 8) {
      return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6)}`;
    }
    return dateStr;
  };

  const isGithubUrl = project.url.includes("github.com");

  return (
    <div className={`${compact ? "rounded-lg p-4" : "rounded-xl p-4"} backdrop-blur-md border border-white/10 hover:border-highlight/30 transition-colors bg-white/4`}>
      <div className="flex gap-4">
        <div className={`w-16 h-16 ${!compact ? 'md:w-32 md:h-32' : ''} rounded-lg bg-white/5 backdrop-blur-md flex items-center justify-center flex-shrink-0`}>
          {project.cover?.imageUrl ? (
            <FadeInImage
              fill
              src={project.cover.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className={`${compact ? "text-2xl" : "text-xl"} text-link font-mono`}>
              {project.cover?.iconText || project.title.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className={`flex items-center gap-2 ${compact ? "" : "mb-2"}`}>
            <h4 className={`${compact ? "text-content/80 font-medium text-md" : "text-xl text-highlight"}`}>{project.title}</h4>
            {store.innerWidth >= 768 && !compact && (
              <>
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(project.status)}`}>
                  {store.t(project.status)}
                </span>
                {isGithubUrl && (
                  <span className="text-xs text-subtitle flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {githubStarsStore.getStars(project.url) ?? "…"}
                  </span>
                )}
              </>
            )}
          </div>
          {store.innerWidth < 768 && !compact && (
            <div className="flex flex-row gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(project.status)}`}>
                {store.t(project.status)}
              </span>
              {isGithubUrl && (
                <span className="text-xs text-subtitle flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {githubStarsStore.getStars(project.url) ?? "…"}
                </span>
              )}
            </div>
          )}

          <p className={`${compact ? "text-content/65 text-xs mt-1" : "text-subtitle mb-3"}`}>{linkify(store.t(project))}</p>
          {!compact && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {project.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="text-xs text-subtitle bg-white/10 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {project.date && (
                <span className="text-xs text-subtitle/60">{formatDate(project.date)}</span>
              )}
            </div>
          )}
          {compact && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(project.status)}`}>
                {store.t(project.status)}
              </span>
              {isGithubUrl && (
                <span className="text-xs text-subtitle flex items-center gap-1 ml-auto">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {githubStarsStore.getStars(project.url) ?? "…"}
                </span>
              )}
            </div>
          )}
          {!compact && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-link text-sm hover:text-highlight"
            >
              {store.t('View Project')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
});
