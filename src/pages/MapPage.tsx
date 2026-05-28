import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { fetchOrganizations, type DbOrganization } from "@/api/organizations";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-expect-error leaflet private
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

function parseCoords(raw: string | null): [number, number] | null {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return null;
}

export default function MapPage({ onNavigate }: Props) {
  const [orgs, setOrgs] = useState<DbOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<DbOrganization | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    fetchOrganizations().then((data) => {
      setOrgs(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading || !mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: [52.5, 83.0],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;
  }, [loading]);

  useEffect(() => {
    if (!mapRef.current || loading) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    orgs.filter((o) => parseCoords(o.coordinates)).forEach((org) => {
      const coords = parseCoords(org.coordinates)!;
      const marker = L.marker(coords)
        .addTo(mapRef.current!)
        .bindPopup(
          `<div style="font-size:13px;max-width:220px">
            <strong style="font-size:13px;line-height:1.3">${org.name}</strong>
            ${org.city ? `<div style="color:#666;font-size:11px;margin-top:2px">${org.city}</div>` : ""}
            ${org.phones ? `<div style="margin-top:4px;font-size:12px">📞 ${org.phones.split(";")[0].trim()}</div>` : ""}
            <div style="margin-top:8px">
              <a href="#" onclick="window.__orgNav('${org.id}');return false;" style="color:#c1440e;font-size:12px;font-weight:600">Подробнее →</a>
            </div>
          </div>`,
          { maxWidth: 240 }
        )
        .on("click", () => setSelectedOrg(org));

      markersRef.current.push(marker);
    });
  }, [orgs, loading]);

  useEffect(() => {
    (window as Window & { __orgNav?: (id: string) => void }).__orgNav = (id: string) => {
      onNavigate("org", { id });
    };
    return () => {
      delete (window as Window & { __orgNav?: (id: string) => void }).__orgNav;
    };
  }, [onNavigate]);

  const orgsWithCoords = orgs.filter((o) => parseCoords(o.coordinates));

  return (
    <div className="min-h-screen animate-fade-in flex flex-col">
      <div className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-2xl font-medium text-[hsl(var(--foreground))] mb-0.5">Карта организаций</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {loading ? "Загрузка..." : `${orgsWithCoords.length} организаций на карте`}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-4 space-y-4">
        {loading ? (
          <div className="h-80 bg-[hsl(var(--muted))] rounded-2xl animate-pulse flex items-center justify-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Загрузка карты...</p>
          </div>
        ) : (
          <div
            ref={mapDivRef}
            className="rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-sm"
            style={{ height: 380 }}
          />
        )}

        {selectedOrg && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--terra))/30] p-4 animate-slide-up">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-semibold text-sm text-[hsl(var(--foreground))] leading-snug">{selectedOrg.name}</div>
              <button onClick={() => setSelectedOrg(null)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex-shrink-0">
                <Icon name="X" size={14} />
              </button>
            </div>
            {selectedOrg.city && (
              <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] mb-1">
                <Icon name="MapPin" size={11} />
                {selectedOrg.city}{selectedOrg.address && `, ${selectedOrg.address}`}
              </div>
            )}
            {selectedOrg.phones && (
              <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                📞 {selectedOrg.phones.split(";")[0].trim()}
              </div>
            )}
            <button
              onClick={() => onNavigate("org", { id: String(selectedOrg.id) })}
              className="w-full py-2 rounded-xl bg-[hsl(var(--terra))] text-white text-xs font-semibold hover:bg-[hsl(16,55%,42%)] transition-colors"
            >
              Открыть карточку →
            </button>
          </div>
        )}

        {!loading && (
          <div>
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Все на карте</p>
            <div className="space-y-2">
              {orgsWithCoords.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    const coords = parseCoords(org.coordinates);
                    if (coords && mapRef.current) {
                      mapRef.current.setView(coords, 13, { animate: true });
                    }
                    setSelectedOrg(org);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-white text-left hover:border-[hsl(var(--terra))/40] hover:bg-[hsl(var(--terra-light))] transition-all"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-[hsl(var(--muted))]">
                    🏥
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))] truncate">{org.name}</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{org.city}</div>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
