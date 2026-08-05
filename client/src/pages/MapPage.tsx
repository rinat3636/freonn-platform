import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import { trpc } from "@/lib/trpc";
import { HlsPlayer } from "@/components/HlsPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Loader2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
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
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Просрочено ${Math.abs(diff)} дн.`;
  if (diff === 0) return "Сегодня срок";
  return `Осталось ${diff} дн.`;
}

export default function MapPage() {
  const projects = trpc.projects.list.useQuery();
  const [openId, setOpenId] = useState<number | null>(null);

  const center = useMemo(() => {
    const withCoords = projects.data?.filter(p => p.lat != null && p.lng != null);
    if (!withCoords?.length) return [55.7558, 37.6173] as [number, number];
    const lat = withCoords.reduce((s, p) => s + (p.lat ?? 0), 0) / withCoords.length;
    const lng = withCoords.reduce((s, p) => s + (p.lng ?? 0), 0) / withCoords.length;
    return [lat, lng] as [number, number];
  }, [projects.data]);

  return (
    <div className="h-[calc(100vh-64px)] -mx-4 md:-mx-6 -mt-4 md:-mt-6 relative bg-muted/30">
      {projects.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-[500] bg-background/60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <MapContainer center={center} zoom={10} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projects.data?.map(p => (
          <ProjectMarker key={p.id} project={p} isOpen={openId === p.id} onOpen={() => setOpenId(p.id)} onClose={() => setOpenId(null)} />
        ))}
      </MapContainer>
    </div>
  );
}

function ProjectMarker({ project, isOpen, onOpen, onClose }: { project: any; isOpen: boolean; onOpen: () => void; onClose: () => void }) {
  const hasCoords = project.lat != null && project.lng != null;
  const geocode = trpc.projects.geocode.useQuery(
    { address: project.address ?? "" },
    { enabled: !hasCoords && !!project.address, retry: 1, staleTime: Infinity, refetchOnWindowFocus: false }
  );

  const lat = hasCoords ? project.lat : geocode.data?.lat;
  const lng = hasCoords ? project.lng : geocode.data?.lng;

  if (lat == null || lng == null) return null;

  return (
    <Marker
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
  const cameras = trpc.cameras.list.useQuery({ projectId: project.id }, { enabled: isOpen });
  const status = statusLabels[project.status] ?? project.status;
  const statusColor = statusBadgeColors[project.status] ?? "bg-muted";

  return (
    <div className="space-y-3 min-w-[260px]">
      <div>
        <h3 className="font-bold text-base leading-tight">{project.name}</h3>
        {project.address && <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {project.address}</div>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={`${statusColor} border font-medium text-xs`}>{status}</Badge>
        <Badge variant="outline" className="font-medium text-xs">{daysLeft(project.plannedEndDate)}</Badge>
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
          <div className="text-xs text-muted-foreground">Камеры не подключены</div>
        )}
        {cameras.data && cameras.data.length > 0 && (
          <div className="space-y-2">
            {cameras.data.slice(0, 1).map((cam: any) => (
              <div key={cam.id}>
                <div className="text-xs font-semibold mb-1">{cam.name}</div>
                {cam.hlsUrl ? (
                  <HlsPlayer src={cam.hlsUrl} className="aspect-video w-full rounded-lg bg-black" />
                ) : (
                  <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">Нет потока</div>
                )}
              </div>
            ))}
            {cameras.data.length > 1 && (
              <div className="text-xs text-muted-foreground">+{cameras.data.length - 1} камера</div>
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
