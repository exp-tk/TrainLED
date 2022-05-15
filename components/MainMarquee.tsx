import { useCallback, useMemo } from "react";
import Marquee from "react-fast-marquee";
import styled from "styled-components";
import type { Station } from "../models/StationAPI";

const InnerContainer = styled.div`
  display: flex;
  mask: radial-gradient(1px, #fff 100%, transparent 100%) 0 0/2px 2px;
`;

const TextContainer = styled.div`
  font-size: 5rem;
  white-space: nowrap;
  display: flex;
  user-select: none;
`;

const GreenText = styled.span`
  color: green;
`;
const RedText = styled.span`
  color: red;
`;
const YellowText = styled.span`
  color: yellow;
`;

const Spacer = styled.div`
  width: 50vw;
`;
const LanguageSpacer = styled.div`
  width: 5vw;
`;

type Props = {
  bound: Station;
  currentStation: Station | undefined;
  nextStation: Station | undefined;
  arrived: boolean;
  approaching: boolean;
};
type SwitchedStationTextProps = {
  arrived: boolean;
  approaching: boolean;
  currentStation: Station | undefined;
  nextStation: Station | undefined;
};

const SwitchedStationText = ({
  arrived,
  approaching,
  currentStation,
  nextStation,
}: SwitchedStationTextProps) => {
  const getFullStationNumber = useCallback((station: Station) => {
    if (station.extraFullStationNumber) {
      return `(${station.fullStationNumber}/${station.secondaryFullStationNumber}/${station.extraFullStationNumber})`;
    }
    if (station.secondaryFullStationNumber) {
      return `(${station.fullStationNumber}/${station.secondaryFullStationNumber})`;
    }
    if (station.fullStationNumber) {
      return `(${station.fullStationNumber})`;
    }
    return "";
  }, []);

  if (arrived && currentStation) {
    return (
      <TextContainer>
        <GreenText>ただいま</GreenText>
        <RedText>{currentStation.name}</RedText>
        <LanguageSpacer />
        <GreenText>ただいま{currentStation.nameK}</GreenText>

        <LanguageSpacer />
        <YellowText>
          {currentStation.nameR}
          {getFullStationNumber(currentStation)}.
        </YellowText>
      </TextContainer>
    );
  }
  if (approaching && nextStation) {
    return (
      <TextContainer>
        <GreenText>まもなく</GreenText>
        <RedText>{nextStation.name}</RedText>
        <LanguageSpacer />
        <GreenText>まもなく{nextStation.nameK}</GreenText>

        <LanguageSpacer />
        <YellowText>
          Next {nextStation.nameR} {getFullStationNumber(nextStation)}.
        </YellowText>
      </TextContainer>
    );
  }

  if (!nextStation) {
    return null;
  }
  return (
    <TextContainer>
      <GreenText>次は</GreenText>
      <RedText>{nextStation.name}</RedText>
      <LanguageSpacer />
      <GreenText>つぎは{nextStation.nameK}</GreenText>

      <LanguageSpacer />
      <YellowText>
        Next {nextStation.nameR} {getFullStationNumber(nextStation)}.
      </YellowText>
    </TextContainer>
  );
};

const MainMarquee = (props: Props) => {
  const { bound, ...rest } = props;

  const boundStationNumbers = useMemo(() => {
    if (bound.extraFullStationNumber) {
      return `(${bound.fullStationNumber}/${bound.secondaryFullStationNumber}/${bound.extraFullStationNumber})`;
    }
    if (bound.secondaryFullStationNumber) {
      return `(${bound.fullStationNumber}/${bound.secondaryFullStationNumber})`;
    }
    if (bound.fullStationNumber) {
      return `(${bound.fullStationNumber})`;
    }
    return "";
  }, [
    bound.extraFullStationNumber,
    bound.fullStationNumber,
    bound.secondaryFullStationNumber,
  ]);

  return (
    <Marquee gradient={false} speed={180}>
      <InnerContainer>
        <Spacer />
        <TextContainer>
          <GreenText>この電車は</GreenText>
          <RedText>{bound.name}ゆき。</RedText>
          <LanguageSpacer />
          <YellowText>
            For {bound.nameR}
            {boundStationNumbers}.
          </YellowText>
        </TextContainer>
        <Spacer />
        <SwitchedStationText {...rest} />
      </InnerContainer>
    </Marquee>
  );
};

export default MainMarquee;
