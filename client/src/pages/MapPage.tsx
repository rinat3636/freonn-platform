import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import { trpc } from "@/lib/trpc";
import { HlsPlayer } from "@/components/HlsPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { Link } from "wouter";
import MapViewport from "@/components/MapViewport";
import { Input } from "@/components/ui/input";
import "leaflet/dist/leaflet.css";

const statusLabels: Record<string, string> = {
  active: "В работе",
  paused: "Приостановлен",
  completed: "Завершен",
  cancelled: "Отменен",
};

const statusBadgeColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 border-blue-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusPinColors: Record<string, string> = {
  active: "#2563EB",
  paused: "#F59E0B",
  completed: "#10B981",
  cancelled: "#6B7280",
};

function pinIcon(status?: string | null) {
  const color = statusPinColors[status ?? ""] ?? "#ED1C24";
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="40"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
}

function daysLeft(end: Date | string | null | undefined): string {
  if (!end) return "—";
  const diff = Math.ceil(
    (new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return `Просрочено ${Math.abs(diff)} дн.`;
  if (diff === 0) return "Сегодня срок";
  return `Осталось ${diff} дн.`;
}

export default function MapPage() {
  const projects = trpc.projects.list.useQuery();
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [positions, setPositions] = useState<Record<number, [number, number]>>(
    {}
  );
  const setPosition = useCallback(
    (projectId: number, position: [number, number]) => {
      setPositions(current => {
        const previous = current[projectId];
        if (previous?.[0] === position[0] && previous?.[1] === position[1])
          return current;
        return { ...current, [projectId]: position };
      });
    },
    []
  );
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects.data ?? [];
    return (projects.data ?? []).filter(
      project =>
        project.name.toLowerCase().includes(query) ||
        (project.address ?? "").toLowerCase().includes(query)
    );
  }, [projects.data, search]);

  return (
    <div className="relative -mx-4 -mt-4 min-h-[480px] h-[calc(100vh-64px-64px-env(safe-area-inset-bottom))] bg-muted/30 md:-mx-6 md:-mt-6 lg:h-[calc(100vh-64px)] z-0">
      {projects.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-[500] bg-background/60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div className="absolute right-4 top-4 z-[500] w-56 -translate-x-0 md:left-auto md:w-80">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card/95 px-4 py-3 text-left text-sm font-semibold shadow-lg backdrop-blur-xl md:hidden"
          onClick={() => setListOpen(current => !current)}
          aria-expanded={listOpen}
        >
          Объекты ({projects.data?.length ?? 0})
          {listOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <div
          className={`mt-2 overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-lg backdrop-blur-xl ${
            listOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="border-b border-border/60 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Поиск объектов…"
                className="h-10 rounded-xl border-border/60 bg-background pl-9"
              />
            </div>
          </div>
          <div className="max-h-[min(55vh,26rem)] overflow-y-auto p-2">
            {projects.isLoading ? (
              <div className="flex items-center justify-center gap-2 p-5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Загрузка объектов…
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-5 text-center text-sm text-muted-foreground">
                Объекты не найдены
              </div>
            ) : (
              filteredProjects.map(project => {
                const position = positions[project.id];
                const hasPosition = !!position;
                const isSelected = selectedId === project.id;
                return (
                  <button
                    key={project.id}
                    type="button"
                    disabled={!hasPosition}
                    onClick={() => {
                      if (!hasPosition) return;
                      setSelectedId(project.id);
                      setOpenId(project.id);
                      setListOpen(false);
                    }}
                    className={`group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      hasPosition
                        ? "hover:bg-accent"
                        : "cursor-not-allowed opacity-50"
                    } ${isSelected ? "bg-primary/10" : ""}`}
                  >
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          statusPinColors[project.status] ?? "#ED1C24",
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {project.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {project.address || "Адрес не указан"}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            statusBadgeColors[project.status] ?? "bg-muted"
                          }`}
                        >
                          {statusLabels[project.status] ?? project.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {hasPosition
                            ? daysLeft(project.plannedEndDate)
                            : "нет координат"}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
      <MapContainer
        center={[55.7558, 37.6173]}
        zoom={10}
        zoomControl={true}
        attributionControl={false}
        className="h-full min-h-[480px] w-full"
        scrollWheelZoom
      >
        <MapViewport positions={positions} selectedId={selectedId} />
        <TileLayer
          attribution=""
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        {projects.data?.map(p => (
          <ProjectMarker
            key={p.id}
            project={p}
            isOpen={openId === p.id}
            isSelected={selectedId === p.id}
            onOpen={() => setOpenId(p.id)}
            onClose={() => setOpenId(null)}
            onPosition={setPosition}
          />
        ))}
      </MapContainer>
    </div>
  );
}

function ProjectMarker({
  project,
  isOpen,
  isSelected,
  onOpen,
  onClose,
  onPosition,
}: {
  project: any;
  isOpen: boolean;
  isSelected: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPosition: (projectId: number, position: [number, number]) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const { data: geocoded } = trpc.projects.geocode.useQuery(
    { address: project.address ?? "" },
    {
      enabled:
        (project.lat == null || project.lng == null) && !!project.address,
      retry: 1,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
  const hasCoords = project.lat != null && project.lng != null;
  const lat = hasCoords ? project.lat : geocoded?.lat;
  const lng = hasCoords ? project.lng : geocoded?.lng;

  useEffect(() => {
    if (lat != null && lng != null) onPosition(project.id, [lat, lng]);
  }, [lat, lng, onPosition, project.id]);

  useEffect(() => {
    if (isSelected) markerRef.current?.openPopup();
  }, [isSelected]);

  if (lat == null || lng == null) return null;

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={pinIcon(project.status)}
      eventHandlers={{ click: onOpen, popupclose: onClose }}
    >
      <Popup maxWidth={320} minWidth={280}>
        <PopupContent project={project} isOpen={isOpen} />
      </Popup>
    </Marker>
  );
}

function PopupContent({ project, isOpen }: { project: any; isOpen: boolean }) {
  const cameras = trpc.cameras.list.useQuery(
    { projectId: project.id },
    { enabled: isOpen }
  );
  const status = statusLabels[project.status] ?? project.status;
  const statusColor = statusBadgeColors[project.status] ?? "bg-muted";

  return (
    <div className="space-y-3 min-w-[260px]">
      <div>
        <h3 className="font-bold text-base leading-tight">{project.name}</h3>
        {project.address && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {project.address}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={`${statusColor} border font-medium text-xs`}>
          {status}
        </Badge>
        <Badge variant="outline" className="font-medium text-xs">
          {daysLeft(project.plannedEndDate)}
        </Badge>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs font-medium mb-1">
          <span className="text-muted-foreground">Прогресс</span>
          <span>{project.progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${project.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Камеры</span>
        </div>
        {isOpen && cameras.isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Загрузка камер…
          </div>
        )}
        {!cameras.isLoading && cameras.data?.length === 0 && (
          <div className="text-xs text-muted-foreground">
            Камеры не подключены
          </div>
        )}
        {cameras.data && cameras.data.length > 0 && (
          <div className="space-y-2">
            {cameras.data.slice(0, 1).map((cam: any) => (
              <div key={cam.id}>
                <div className="text-xs font-semibold mb-1">{cam.name}</div>
                {cam.hlsUrl ? (
                  <HlsPlayer
                    src={cam.hlsUrl}
                    className="aspect-video w-full rounded-lg bg-black"
                  />
                ) : (
                  <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    Нет потока
                  </div>
                )}
              </div>
            ))}
            {cameras.data.length > 1 && (
              <div className="text-xs text-muted-foreground">
                +{cameras.data.length - 1} камера
              </div>
            )}
          </div>
        )}
      </div>

      <Link href={`/projects/${project.id}`}>
        <Button variant="outline" size="sm" className="w-full mt-2">
          <ExternalLink className="h-3.5 w-3.5 mr-2" /> Открыть объект
        </Button>
      </Link>
    </div>
  );
}
