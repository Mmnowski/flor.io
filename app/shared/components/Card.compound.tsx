import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface CardRootProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card compound component for flexible card layouts
 * Provides semantic subcomponents for common card patterns
 *
 * @example
 * <Card>
 *   <Card.Header>
 *     <Card.Title>Plant Details</Card.Title>
 *     <Card.Description>View and edit</Card.Description>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Content here</p>
 *   </Card.Body>
 * </Card>
 */
export function CardCompound({ children, className }: CardRootProps): React.ReactNode {
  return <Card className={className}>{children}</Card>;
}

/**
 * Card header compound component
 */
CardCompound.Header = function CardCompoundHeader({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return <CardHeader>{children}</CardHeader>;
};

/**
 * Card title compound component
 */
CardCompound.Title = function CardCompoundTitle({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return <CardTitle>{children}</CardTitle>;
};

/**
 * Card description compound component
 */
CardCompound.Description = function CardCompoundDescription({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return <CardDescription>{children}</CardDescription>;
};

/**
 * Card body/content compound component
 */
CardCompound.Body = function CardCompoundBody({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return <CardContent>{children}</CardContent>;
};
