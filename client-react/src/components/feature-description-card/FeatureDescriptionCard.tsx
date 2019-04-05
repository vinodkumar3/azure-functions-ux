import * as React from 'react';
import ReactSVG from 'react-svg';
import { style } from 'typestyle';

interface FeatureDescriptionCardProps {
  name: string;
  description: string;
  iconUrl: string;
  learnMoreLink?: string;
}

const iconClass = style({
  height: '20px',
  width: '20px',
});

const FeatureDescriptionCard = (props: FeatureDescriptionCardProps) => {
  const { iconUrl, name, description } = props;

  return (
    <div>
      <span>
        <ReactSVG className={iconClass} src={iconUrl} />
      </span>
      <h2>{name}</h2>
      <h5>{description}</h5>
    </div>
  );
};

export default FeatureDescriptionCard;
