import React from "react";
import { Composition, Still } from "remotion";
import { FluyentaInterview, FI_FRAMES } from "./fluyenta-interview/FluyentaInterview";
import { FluyentaInterviewThumb916, FluyentaInterviewThumb169 } from "./fluyenta-interview/FluyentaInterviewThumb";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FluyentaInterview" component={FluyentaInterview} durationInFrames={FI_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="FluyentaInterviewThumb916" component={FluyentaInterviewThumb916} width={1080} height={1920} />
    <Still id="FluyentaInterviewThumb169" component={FluyentaInterviewThumb169} width={1920} height={1080} />
  </>
);
