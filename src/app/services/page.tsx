"use client";

import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import Link from "next/link";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import { ContentPageHeader } from "@/components/ContentPageHeader";
import { Service } from "@/types";
import FadeInImage from "@/components/FadeInImage";

const SYNC_KEY = "showLanUrl";

const filterOptions = [
  { key: "ALL", label: "All" },
  { key: "PUBLIC", label: "Public" },
  { key: "PRIVATE", label: "Private" },
] as const;

const ServiceCardContent = ({ service }: { service: Service }) => (
  <>
    <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0">
      <FadeInImage
        src={service.iconUrl}
        alt={service.name}
        width={64}
        height={64}
        className="object-contain mb-4"
      />
    </div>
    <h3 className="text-title text-md font-medium text-center truncate">{service.name}</h3>
    <div className="flex gap-1 mt-2 flex-wrap justify-center">
      <span className={`text-xs px-2 py-1 rounded ${service.type === "PUBLIC"
        ? "text-green-200/80 bg-green-200/10"
        : "text-yellow-200/80 bg-yellow-200/10"
        }`}>
        {store.t(filterOptions.find(o => o.key === service.type)?.label || service.type)}
      </span>
      {service.lanUrl && (
        <span className="text-xs px-2 py-1 rounded text-blue-200/80 bg-blue-200/10">
          LAN
        </span>
      )}
    </div>
  </>
);

const isExternalUrl = (url: string) => {
  try {
    return new URL(url).hostname !== location.hostname;
  } catch {
    return true;
  }
};

export const ServiceList = observer(() => {
  const services = store.services;
  const [showLanUrl, setShowLanUrl] = useState(false);

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

    const saved = localStorage.getItem(SYNC_KEY);
    if (saved !== null) {
      setShowLanUrl(saved === "true");
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

  const toggleLanUrl = (checked: boolean) => {
    setShowLanUrl(checked);
    localStorage.setItem(SYNC_KEY, checked.toString());
  };

  const filteredServices = services.filter((item) =>
    filter === "ALL" ? true : item.type === filter
  );

  return (
    <div className="space-y-6">
      <ContentPageHeader
        title={'Services'}
        subtitle={'Public and private services that WTAKO Network is hosting'}
        filterOptions={filterOptions}
        filterKey={filter}
        onFilterChange={updateFilter}
        sortByLatest={false}
        onSortToggle={() => { }}
        hideSortButton={true}
      />

      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showLanUrl}
            onChange={(e) => toggleLanUrl(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer bg-white/20 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400/60"></div>
          <span className="ml-3 text-sm font-medium">{store.t('LAN URLs')}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filteredServices.map((service: Service, index: number) => {
          const targetUrl = showLanUrl && service.lanUrl ? service.lanUrl : service.url;
          const external = store.inited && isExternalUrl(targetUrl);

          return external ? (
            <a
              key={index}
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 hover:border-white/20 hover:bg-white/6 transition-colors aspect-square flex flex-col items-center justify-center group"
            >
              <ServiceCardContent service={service} />
            </a>
          ) : (
            <Link
              key={index}
              href={targetUrl}
              className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 hover:border-white/20 hover:bg-white/6 transition-colors aspect-square flex flex-col items-center justify-center group"
            >
              <ServiceCardContent service={service} />
            </Link>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16">
          <p className="text-subtitle text-lg">{store.t('No services found.')}</p>
        </div>
      )}
    </div>
  );
});

export default function ServicePage() {
  return (
    <Layout>
      <ServiceList />
    </Layout>
  );
}
