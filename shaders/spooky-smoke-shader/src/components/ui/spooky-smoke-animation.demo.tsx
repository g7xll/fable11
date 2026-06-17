import { SmokeBackground } from "@/components/ui/spooky-smoke-animation";

// Canonical shadcn-style demo entries for the SmokeBackground component.
// These mirror the demo.tsx provided alongside the component and document the
// two supported usages: the default gray vapour and a custom-coloured field.

const Default = () => {
  return <SmokeBackground />;
};

const Customized = () => {
  return <SmokeBackground smokeColor="#FF0000" />;
};

export { Default, Customized };
