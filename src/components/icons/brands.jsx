import React from 'react';
import { 
  siGithub, 
  siGoogle, 
  siFacebook, 
  siTwitter, 
  siYoutube, 
  siX,
  siXiaohongshu,
  siSinaweibo,
  siDouban
} from 'simple-icons';

const IconWrapper = ({ children, size = 24, title, className }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
  >
    <title>{title}</title>
    {children}
  </svg>
);

export const Github = ({ size = 24, className }) => (
  <IconWrapper size={size} title="GitHub" className={className}>
    <path d={siGithub.path} />
  </IconWrapper>
);

export const Google = ({ size = 24, className }) => (
  <IconWrapper size={size} title="Google" className={className}>
    <path d={siGoogle.path} />
  </IconWrapper>
);

export const Facebook = ({ size = 24, className }) => (
  <IconWrapper size={size} title="Facebook" className={className}>
    <path d={siFacebook.path} />
  </IconWrapper>
);

export const Youtube = ({ size = 24, className }) => (
  <IconWrapper size={size} title="YouTube" className={className}>
    <path d={siYoutube.path} />
  </IconWrapper>
);

export const Twitter = ({ size = 24, className }) => (
  <IconWrapper size={size} title="Twitter" className={className}>
    <path d={siTwitter.path} />
  </IconWrapper>
);

export const X = ({ size = 24, className }) => (
  <IconWrapper size={size} title="X" className={className}>
    <path d={siX.path} />
  </IconWrapper>
);

export const Xiaohongshu = ({ size = 24, className }) => (
  <IconWrapper size={size} title="小红书" className={className}>
    <path d={siXiaohongshu.path} />
  </IconWrapper>
);

export const Weibo = ({ size = 24, className }) => (
  <IconWrapper size={size} title="新浪微博" className={className}>
    <path d={siSinaweibo.path} />
  </IconWrapper>
);

export const Douban = ({ size = 24, className }) => (
  <IconWrapper size={size} title="豆瓣" className={className}>
    <path d={siDouban.path} />
  </IconWrapper>
);