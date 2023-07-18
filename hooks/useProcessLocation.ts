import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { lineAtom } from "../atoms/line";
import { navigationAtom } from "../atoms/navigation";
import { stationAtom } from "../atoms/station";
import { LineType, Station } from "../models/grpc";
import {
  getAvgStationBetweenDistances,
  scoreStationDistances,
} from "../utils/distance";
import getNextStation from "../utils/getNextStation";
import getIsPass from "../utils/isPass";
import {
  getApproachingThreshold,
  getArrivedThreshold,
} from "../utils/threshold";

const useProcessLocation = () => {
  const [{ station, stations, selectedBound }, setStationAtom] =
    useAtom(stationAtom);
  const { selectedDirection, selectedLine } = useAtomValue(lineAtom);
  const isMountedRef = useRef(false);

  const [{ location }, setNavigationAtom] = useAtom(navigationAtom);

  const displayedNextStation = getNextStation(stations, station);

  const isArrived = useCallback(
    (nearestStation: Station, avgDistance: number): boolean => {
      if (!nearestStation) {
        return false;
      }
      const ARRIVED_THRESHOLD = getArrivedThreshold(
        selectedLine?.lineType,
        avgDistance
      );
      return (nearestStation.distance || 0) < ARRIVED_THRESHOLD;
    },
    [selectedLine?.lineType]
  );

  const isApproaching = useCallback(
    (nearestStation: Station, avgDistance: number): boolean => {
      if (!displayedNextStation || !nearestStation) {
        return false;
      }
      const APPROACHING_THRESHOLD = getApproachingThreshold(
        selectedLine?.lineType,
        avgDistance
      );
      // 一番近い駅が通過駅で、次の駅が停車駅の場合、
      // 一番近い駅に到着（通過）した時点でまもなく扱いにする
      const isNextStationIsNextStop =
        displayedNextStation?.id !== nearestStation.id &&
        getIsPass(nearestStation) &&
        !getIsPass(displayedNextStation);
      if (
        isNextStationIsNextStop &&
        selectedLine?.lineType !== LineType.BULLETTRAIN
      ) {
        return true;
      }

      const nearestStationIndex = stations.findIndex(
        (s) => s.id === nearestStation.id
      );
      const nextStationIndex = stations.findIndex(
        (s) => s.id === displayedNextStation?.id
      );
      const isNearestStationLaterThanCurrentStop =
        selectedDirection === "INBOUND"
          ? nearestStationIndex >= nextStationIndex
          : nearestStationIndex <= nextStationIndex;

      // APPROACHING_THRESHOLD以上次の駅から離れている: つぎは
      // APPROACHING_THRESHOLDより近い: まもなく
      return (
        (nearestStation.distance || 0) < APPROACHING_THRESHOLD &&
        isNearestStationLaterThanCurrentStop
      );
    },
    [displayedNextStation, selectedDirection, selectedLine?.lineType, stations]
  );

  useEffect(() => {
    if (!location || !selectedBound) {
      return;
    }
    const { latitude, longitude } = location.coords;

    const scoredStations = scoreStationDistances(
      stations,
      latitude,
      longitude
    ).filter((s) => !getIsPass(s));
    const nearestStation = scoredStations[0];
    const avg = getAvgStationBetweenDistances(stations);
    const arrived = isArrived(nearestStation, avg);
    const approaching = isApproaching(nearestStation, avg);

    setNavigationAtom((prev) => ({ ...prev, arrived, approaching }));

    if (arrived || !isMountedRef.current) {
      setStationAtom((prev) => ({ ...prev, station: nearestStation }));
      isMountedRef.current = true;
    }
  }, [
    isApproaching,
    isArrived,
    location,
    selectedBound,
    setNavigationAtom,
    setStationAtom,
    stations,
  ]);
};

export default useProcessLocation;