/**
 * FluencyLevelBadge Demo Component
 * 
 * This file provides a visual demonstration of the FluencyLevelBadge component
 * with all its variants and configurations. Use this to manually test the component
 * in the browser.
 * 
 * To use: Import and render this component in your app temporarily.
 */

import { FluencyLevelBadge } from '../FluencyLevelBadge';
import type { FluencyLevelCode } from '../../types/fluency';

export function FluencyLevelBadgeDemo() {
  const levels: FluencyLevelCode[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div>
        <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
          FluencyLevelBadge Component Demo
        </h1>
        <p className="text-zinc-600">
          Visual demonstration of all FluencyLevelBadge variants and configurations
        </p>
      </div>

      {/* All Levels - Medium Size */}
      <section className="bg-white p-6 border border-zinc-200">
        <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>
          All Levels (Medium Size)
        </h2>
        <div className="flex flex-wrap gap-3">
          {levels.map((level) => (
            <FluencyLevelBadge key={level} level={level} />
          ))}
        </div>
      </section>

      {/* All Levels with Labels */}
      <section className="bg-white p-6 border border-zinc-200">
        <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>
          All Levels with Labels
        </h2>
        <div className="flex flex-wrap gap-3">
          {levels.map((level) => (
            <FluencyLevelBadge key={level} level={level} showLabel={true} />
          ))}
        </div>
      </section>

      {/* Size Variants */}
      <section className="bg-white p-6 border border-zinc-200">
        <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>
          Size Variants (A2 Level)
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2">Small</p>
            <FluencyLevelBadge level="A2" size="small" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Medium (Default)</p>
            <FluencyLevelBadge level="A2" size="medium" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Large</p>
            <FluencyLevelBadge level="A2" size="large" />
          </div>
        </div>
      </section>

      {/* Size Variants with Labels */}
      <section className="bg-white p-6 border border-zinc-200">
        <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>
          Size Variants with Labels (B1 Level)
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2">Small</p>
            <FluencyLevelBadge level="B1" size="small" showLabel={true} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Medium</p>
            <FluencyLevelBadge level="B1" size="medium" showLabel={true} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Large</p>
            <FluencyLevelBadge level="B1" size="large" showLabel={true} />
          </div>
        </div>
      </section>

      {/* All Combinations Grid */}
      <section className="bg-white p-6 border border-zinc-200">
        <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>
          All Combinations
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left p-3 text-sm" style={{ fontWeight: 600 }}>
                  Level
                </th>
                <th className="text-left p-3 text-sm" style={{ fontWeight: 600 }}>
                  Small
                </th>
                <th className="text-left p-3 text-sm" style={{ fontWeight: 600 }}>
                  Small + Label
                </th>
                <th className="text-left p-3 text-sm" style={{ fontWeight: 600 }}>
                  Medium
                </th>
                <th className="text-left p-3 text-sm" style={{ fontWeight: 600 }}>
                  Medium + Label
                </th>
                <th className="text-left p-3 text-sm" style={{ fontWeight: 600 }}>
                  Large
                </th>
                <th className="text-left p-3 text-sm" style={{ fontWeight: 600 }}>
                  Large + Label
                </th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => (
                <tr key={level} className="border-b border-zinc-100">
                  <td className="p-3 text-sm" style={{ fontWeight: 600 }}>
                    {level}
                  </td>
                  <td className="p-3">
                    <FluencyLevelBadge level={level} size="small" />
                  </td>
                  <td className="p-3">
                    <FluencyLevelBadge level={level} size="small" showLabel={true} />
                  </td>
                  <td className="p-3">
                    <FluencyLevelBadge level={level} size="medium" />
                  </td>
                  <td className="p-3">
                    <FluencyLevelBadge level={level} size="medium" showLabel={true} />
                  </td>
                  <td className="p-3">
                    <FluencyLevelBadge level={level} size="large" />
                  </td>
                  <td className="p-3">
                    <FluencyLevelBadge level={level} size="large" showLabel={true} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Usage in Context */}
      <section className="bg-white p-6 border border-zinc-200">
        <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>
          Usage in Context Examples
        </h2>
        
        {/* Profile Header Example */}
        <div className="mb-6">
          <h3 className="text-sm text-zinc-600 mb-3" style={{ fontWeight: 600 }}>
            Profile Header
          </h3>
          <div className="bg-zinc-50 p-4 border border-zinc-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-500 text-white flex items-center justify-center text-2xl" style={{ fontWeight: 700 }}>
                JD
              </div>
              <div className="flex-1">
                <h4 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                  John Doe
                </h4>
                <div className="flex items-center gap-2">
                  <FluencyLevelBadge level="B2" showLabel={true} />
                  <span className="text-sm text-zinc-500">•</span>
                  <span className="text-sm text-zinc-600">Level 12 • 5,420 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card Example */}
        <div className="mb-6">
          <h3 className="text-sm text-zinc-600 mb-3" style={{ fontWeight: 600 }}>
            Stats Card
          </h3>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg" style={{ fontWeight: 600 }}>
                Language Proficiency
              </h4>
              <FluencyLevelBadge level="C1" size="large" />
            </div>
            <p className="text-sm opacity-90">
              You've reached Advanced level! Keep up the excellent work.
            </p>
          </div>
        </div>

        {/* List Item Example */}
        <div>
          <h3 className="text-sm text-zinc-600 mb-3" style={{ fontWeight: 600 }}>
            Student List Item
          </h3>
          <div className="bg-zinc-50 p-4 border border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 text-white flex items-center justify-center text-sm" style={{ fontWeight: 700 }}>
                AB
              </div>
              <div>
                <p className="text-sm mb-1" style={{ fontWeight: 600 }}>
                  Alice Brown
                </p>
                <p className="text-xs text-zinc-500">alice@example.com</p>
              </div>
            </div>
            <FluencyLevelBadge level="A2" size="small" showLabel={true} />
          </div>
        </div>
      </section>

      {/* Hover States */}
      <section className="bg-white p-6 border border-zinc-200">
        <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>
          Hover for Tooltip
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          Hover over any badge to see the level description in a tooltip
        </p>
        <div className="flex flex-wrap gap-3">
          {levels.map((level) => (
            <FluencyLevelBadge key={level} level={level} showLabel={true} />
          ))}
        </div>
      </section>
    </div>
  );
}
