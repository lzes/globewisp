"use client";

import { useEffect, useMemo, useState } from "react";
import {
  geoGraticule10,
  geoNaturalEarth1,
  geoPath,
  type GeoProjection,
} from "d3-geo";
import { feature } from "topojson-client";
import type {
  GeometryCollection,
  Topology,
} from "topojson-specification";
import type {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";

type Country = {
  id: string;
  name: string;
  en: string;
  city: string;
  year: string;
  coords: [number, number];
  color: string;
  photos: Array<{ src: string; alt: string }>;
  note: string;
};

type Route = {
  from: [number, number];
  to: [number, number];
  code: string;
};

type MapPath = {
  id: string;
  name: string;
  path: string;
};

const publicBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const countries: Country[] = [
  {
    id: "156",
    name: "中国",
    en: "CHINA",
    city: "上海 · 大理 · 海口",
    year: "2023—2025",
    coords: [104.2, 35.8],
    color: "#b7ff3c",
    photos: [
      { src: `${publicBase}/photos/01-dunes.jpg`, alt: "阳光下的山脊" },
      { src: `${publicBase}/photos/06-sky.jpg`, alt: "大理的日落天空" },
      { src: `${publicBase}/photos/05-sunset.jpg`, alt: "海口的棕榈树日落" },
    ],
    note: "从熟悉的城市出发，在西南的风和南方的海边，重新认识故乡的尺度。",
  },
  {
    id: "392",
    name: "日本",
    en: "JAPAN",
    city: "东京 · 大阪",
    year: "2024—2025",
    coords: [138.2, 36.2],
    color: "#00e5ff",
    photos: [
      { src: `${publicBase}/photos/07-neon.jpg`, alt: "东京霓虹夜色" },
      { src: `${publicBase}/photos/10-street.jpg`, alt: "大阪雨夜街道" },
      { src: `${publicBase}/photos/09-lantern.jpg`, alt: "夜色中的灯笼" },
    ],
    note: "秩序与偶然在街角相遇。夜晚降临以后，城市的颜色变得比白天更诚实。",
  },
  {
    id: "620",
    name: "葡萄牙",
    en: "PORTUGAL",
    city: "里斯本 · 阿尔加维",
    year: "2024.06",
    coords: [-8.2, 39.6],
    color: "#8c7dff",
    photos: [
      { src: `${publicBase}/photos/02-sea.jpg`, alt: "阿尔加维海岸" },
      { src: `${publicBase}/photos/03-coast.jpg`, alt: "里斯本附近的蓝色海岸" },
      { src: `${publicBase}/photos/04-boat.jpg`, alt: "清澈海水上的白色船只" },
    ],
    note: "大陆最西端的光很慢。电车、坡道和大西洋，把每个下午拉得很长。",
  },
  {
    id: "380",
    name: "意大利",
    en: "ITALY",
    city: "罗马 · 西西里",
    year: "2023.07",
    coords: [12.5, 42.8],
    color: "#ff5c87",
    photos: [
      { src: `${publicBase}/photos/04-boat.jpg`, alt: "西西里海上的白色小船" },
      { src: `${publicBase}/photos/05-sunset.jpg`, alt: "地中海日落剪影" },
      { src: `${publicBase}/photos/01-dunes.jpg`, alt: "暮色里的山脊" },
    ],
    note: "旧石墙吸收了白天的热量，傍晚的海风把岛屿带回温柔的温度。",
  },
  {
    id: "410",
    name: "韩国",
    en: "SOUTH KOREA",
    city: "首尔",
    year: "2025.03",
    coords: [127.8, 36.4],
    color: "#ffb341",
    photos: [
      { src: `${publicBase}/photos/08-night.jpg`, alt: "首尔夜间的行人" },
      { src: `${publicBase}/photos/07-neon.jpg`, alt: "霓虹灯照亮的街道" },
      { src: `${publicBase}/photos/10-street.jpg`, alt: "雨夜中的城市" },
    ],
    note: "凌晨的街道仍然明亮。人群散去之后，只剩便利店、风和路口的信号声。",
  },
  {
    id: "352",
    name: "冰岛",
    en: "ICELAND",
    city: "雷克雅未克 · 维克",
    year: "2024.10",
    coords: [-18.6, 64.9],
    color: "#36f1b9",
    photos: [
      { src: `${publicBase}/photos/01-dunes.jpg`, alt: "荒野中的山脊" },
      { src: `${publicBase}/photos/02-sea.jpg`, alt: "冰岛海岸的云层" },
      { src: `${publicBase}/photos/06-sky.jpg`, alt: "北方天空的暮色" },
    ],
    note: "公路穿过没有树的地平线。天气每十分钟改写一次风景，也改写前进的方向。",
  },
];

const routes: Route[] = [
  { from: [121.47, 31.23], to: [139.69, 35.68], code: "SHA—TYO" },
  { from: [121.47, 31.23], to: [126.98, 37.56], code: "SHA—SEL" },
  { from: [121.47, 31.23], to: [12.5, 41.9], code: "SHA—ROM" },
  { from: [12.5, 41.9], to: [-9.14, 38.72], code: "ROM—LIS" },
  { from: [-9.14, 38.72], to: [-18.6, 64.15], code: "LIS—KEF" },
  { from: [121.47, 31.23], to: [100.5, 13.75], code: "SHA—BKK" },
  { from: [100.5, 13.75], to: [103.82, 1.35], code: "BKK—SIN" },
  { from: [103.82, 1.35], to: [151.21, -33.87], code: "SIN—SYD" },
];

const projection = geoNaturalEarth1()
  .scale(228)
  .translate([600, 305]) as GeoProjection;
const pathBuilder = geoPath(projection);
const graticulePath = pathBuilder(geoGraticule10()) ?? "";

function routePath(route: Route) {
  const from = projection(route.from);
  const to = projection(route.to);
  if (!from || !to) return "";
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const midpointX = (from[0] + to[0]) / 2;
  const midpointY = (from[1] + to[1]) / 2 - Math.min(90, distance * 0.24);
  return `M ${from[0]} ${from[1]} Q ${midpointX} ${midpointY} ${to[0]} ${to[1]}`;
}

export default function Home() {
  const [mapPaths, setMapPaths] = useState<MapPath[]>([]);
  const [activeCountry, setActiveCountry] = useState(countries[0]);
  const [routeMode, setRouteMode] = useState<"dynamic" | "static">("dynamic");
  const [selectedPhoto, setSelectedPhoto] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const visitedIds = useMemo(
    () => new Set(countries.map((country) => country.id)),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadMap() {
      const response = await fetch(`${publicBase}/world-110m.json`);
      const topology = (await response.json()) as Topology<{
        countries: GeometryCollection<GeoJsonProperties>;
      }>;
      const collection = feature(
        topology,
        topology.objects.countries,
      ) as FeatureCollection<Geometry, GeoJsonProperties>;
      const nextPaths = collection.features
        .map((country) => ({
          id: String(country.id ?? "").padStart(3, "0"),
          name: String(country.properties?.name ?? ""),
          path: pathBuilder(country) ?? "",
        }))
        .filter((country) => country.path);
      if (!cancelled) setMapPaths(nextPaths);
    }
    void loadMap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPhoto) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPhoto(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [selectedPhoto]);

  const selectCountry = (country: Country) => {
    setActiveCountry(country);
    window.setTimeout(() => {
      document
        .getElementById("country-album")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <main>
      <header className="topbar">
        <a className="logo" href="#home" aria-label="Memory Atlas 首页">
          <span className="logo-bracket">[</span>
          MEM<span className="logo-slash">//</span>ATLAS
          <span className="logo-bracket">]</span>
        </a>
        <div className="system-status">
          <i />
          SYSTEM ONLINE
        </div>
        <nav aria-label="主导航">
          <a href="#atlas">全球足迹</a>
          <a href="#country-album">国家相册</a>
          <a href="#manifest">飞行日志</a>
        </nav>
        <span className="time-code">UTC+08:00 / 2025</span>
      </header>

      <section className="command-hero" id="home">
        <div className="hero-heading">
          <div>
            <span className="micro-label">PERSONAL TRAVEL MEMORY SYSTEM</span>
            <h1>
              EARTH
              <span>//</span>
              LOG
            </h1>
          </div>
          <p>
            以坐标标记抵达，以影像保存记忆。
            <br />
            一份持续更新的个人环球旅行档案。
          </p>
        </div>

        <div className="stat-line">
          <div>
            <strong>06</strong>
            <span>COUNTRIES VISITED</span>
          </div>
          <div>
            <strong>08</strong>
            <span>FLIGHT ROUTES</span>
          </div>
          <div>
            <strong>42,860</strong>
            <span>KM IN THE AIR</span>
          </div>
          <div className="coordinates">
            <span>CURRENT ORIGIN</span>
            <strong>31.2304°N / 121.4737°E</strong>
          </div>
        </div>
      </section>

      <section className="atlas-section" id="atlas">
        <div className="panel-header">
          <div>
            <span className="panel-index">01</span>
            <div>
              <span className="micro-label">GLOBAL FOOTPRINT</span>
              <h2>世界足迹</h2>
            </div>
          </div>
          <div className="route-controls">
            <span>ROUTE DISPLAY</span>
            <div role="group" aria-label="选择航线展示方式">
              <button
                className={routeMode === "static" ? "active" : ""}
                onClick={() => setRouteMode("static")}
                aria-pressed={routeMode === "static"}
              >
                静态
              </button>
              <button
                className={routeMode === "dynamic" ? "active" : ""}
                onClick={() => setRouteMode("dynamic")}
                aria-pressed={routeMode === "dynamic"}
              >
                动态
              </button>
            </div>
          </div>
        </div>

        <div className="atlas-console">
          <div className="map-wrap">
            <div className="map-readout">
              <span>PROJECTION / NATURAL EARTH</span>
              <span>ZOOM 100%</span>
            </div>
            <svg
              className="world-map"
              viewBox="0 0 1200 610"
              role="img"
              aria-label="去过的国家和全球飞行路线地图"
            >
              <defs>
                <filter id="route-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path className="map-graticule" d={graticulePath} />
              <g className="country-layer">
                {mapPaths.map((mapCountry) => {
                  const visited = countries.find(
                    (country) => country.id === mapCountry.id,
                  );
                  const active = activeCountry.id === mapCountry.id;
                  return (
                    <path
                      key={mapCountry.id}
                      d={mapCountry.path}
                      className={`map-country ${visited ? "visited" : ""} ${
                        active ? "selected" : ""
                      }`}
                      style={
                        visited
                          ? ({ "--country-color": visited.color } as React.CSSProperties)
                          : undefined
                      }
                      role={visited ? "button" : undefined}
                      aria-label={
                        visited
                          ? `打开${visited.name}旅行相册`
                          : mapCountry.name
                      }
                      tabIndex={visited ? 0 : -1}
                      onClick={() => visited && selectCountry(visited)}
                      onKeyDown={(event) => {
                        if (visited && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          selectCountry(visited);
                        }
                      }}
                    >
                      <title>
                        {visited
                          ? `${visited.name} / 点击查看相册`
                          : mapCountry.name}
                      </title>
                    </path>
                  );
                })}
              </g>
              <g
                className={`route-layer ${
                  routeMode === "dynamic" ? "is-dynamic" : "is-static"
                }`}
                filter="url(#route-glow)"
              >
                {routes.map((route, index) => (
                  <path
                    key={route.code}
                    className="route-line"
                    d={routePath(route)}
                    style={{ "--route-delay": `${index * -0.42}s` } as React.CSSProperties}
                  >
                    <title>{route.code}</title>
                  </path>
                ))}
              </g>
              <g className="city-layer">
                {countries.map((country) => {
                  const point = projection(country.coords);
                  if (!point) return null;
                  return (
                    <g
                      key={country.id}
                      transform={`translate(${point[0]} ${point[1]})`}
                      className={activeCountry.id === country.id ? "active" : ""}
                    >
                      <circle className="city-pulse" r="8" />
                      <circle className="city-dot" r="3" />
                      <text x="10" y="-8">
                        {country.en}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
            <div className="map-legend">
              <span>
                <i className="legend-visited" /> 已到访
              </span>
              <span>
                <i className="legend-route" /> 飞行航线
              </span>
              <span>
                <i className="legend-future" /> 未探索
              </span>
            </div>
          </div>

          <aside className="country-index" aria-label="已到访国家">
            <div className="country-index-head">
              <span>VISITED INDEX</span>
              <span>06 / 195</span>
            </div>
            {countries.map((country, index) => (
              <button
                key={country.id}
                className={activeCountry.id === country.id ? "active" : ""}
                onClick={() => selectCountry(country)}
              >
                <span className="country-count">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="country-signal"
                  style={{ background: country.color }}
                />
                <span>
                  <strong>{country.name}</strong>
                  <small>{country.en}</small>
                </span>
                <span className="country-year">{country.year.slice(0, 4)}</span>
                <span className="country-arrow">↗</span>
              </button>
            ))}
            <div className="next-target">
              <span>NEXT TARGET</span>
              <strong>NEW ZEALAND</strong>
              <small>36.8509°S / 174.7645°E</small>
            </div>
          </aside>
        </div>
      </section>

      <section className="album-section" id="country-album">
        <div className="album-header">
          <div>
            <span
              className="album-color"
              style={{ background: activeCountry.color }}
            />
            <span className="panel-index">02</span>
            <span className="micro-label">COUNTRY MEMORY NODE</span>
          </div>
          <span>{activeCountry.year}</span>
        </div>

        <div className="album-title">
          <div>
            <span>{activeCountry.en}</span>
            <h2>{activeCountry.name}</h2>
          </div>
          <p>{activeCountry.note}</p>
          <div>
            <span>LOCATIONS</span>
            <strong>{activeCountry.city}</strong>
          </div>
        </div>

        <div className="album-grid">
          {activeCountry.photos.map((photo, index) => (
            <button
              className={`album-photo album-photo-${index + 1}`}
              key={`${activeCountry.id}-${photo.src}-${index}`}
              onClick={() => setSelectedPhoto(photo)}
              aria-label={`查看${activeCountry.name}相册照片 ${index + 1}`}
            >
              <img src={photo.src} alt={photo.alt} />
              <span>
                FRAME {String(index + 1).padStart(3, "0")}
                <i>↗</i>
              </span>
            </button>
          ))}
          <div className="album-data">
            <span>MEMORY NODE</span>
            <strong>{activeCountry.id} / {activeCountry.en}</strong>
            <p>
              PHOTOS 03
              <br />
              FORMAT 35MM + DIGITAL
              <br />
              STATUS ARCHIVED
            </p>
          </div>
        </div>

        <div className="album-selector">
          <span>SWITCH COUNTRY</span>
          <div>
            {countries.map((country) => (
              <button
                key={country.id}
                className={activeCountry.id === country.id ? "active" : ""}
                style={
                  {
                    "--country-color": country.color,
                  } as React.CSSProperties
                }
                onClick={() => setActiveCountry(country)}
              >
                {country.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="manifest-section" id="manifest">
        <div className="panel-header">
          <div>
            <span className="panel-index">03</span>
            <div>
              <span className="micro-label">FLIGHT DATA ARCHIVE</span>
              <h2>飞行日志</h2>
            </div>
          </div>
          <span className="manifest-year">2023—2025</span>
        </div>
        <div className="manifest-table">
          <div className="manifest-row manifest-head">
            <span>ROUTE</span>
            <span>ORIGIN</span>
            <span>DESTINATION</span>
            <span>DISTANCE</span>
            <span>STATUS</span>
          </div>
          {routes.map((route, index) => (
            <div className="manifest-row" key={route.code}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{route.code.split("—")[0]}</strong>
              <strong>{route.code.split("—")[1]}</strong>
              <span>{[1760, 870, 9150, 1860, 2940, 2890, 1430, 6300][index].toLocaleString()} KM</span>
              <span className="completed">COMPLETED</span>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div>
          <span className="logo">
            <span className="logo-bracket">[</span>
            MEM<span className="logo-slash">//</span>ATLAS
            <span className="logo-bracket">]</span>
          </span>
          <p>TRAVEL MEMORY SYSTEM / PERSONAL ARCHIVE</p>
        </div>
        <p>
          世界仍在展开，
          <br />
          下一段坐标等待被记录。
        </p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          TOP ↑
        </button>
      </footer>

      {selectedPhoto && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="旅行照片大图"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="lightbox-close"
            onClick={() => setSelectedPhoto(null)}
            aria-label="关闭大图"
            autoFocus
          >
            CLOSE [×]
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={selectedPhoto.src} alt={selectedPhoto.alt} />
            <figcaption>
              <span>{activeCountry.en} / MEMORY NODE</span>
              <span>{activeCountry.year}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  );
}
