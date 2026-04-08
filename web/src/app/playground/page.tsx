import { config } from "@/lib/config";
import { PlaygroundClient } from "@/components/playground/PlaygroundClient";

export type NatsConfig = {
  enabled: boolean;
  url: string;
  token: string;
};

export default function PlaygroundPage() {
  const natsConfig: NatsConfig = {
    enabled: config.nats.enabled,
    url: config.nats.url,
    token: config.nats.token,
  };

  return <PlaygroundClient natsConfig={natsConfig} />;
}
