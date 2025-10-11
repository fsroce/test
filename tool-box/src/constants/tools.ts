import type { ToolMetadata } from '../types/tools';
import { ToolCategory } from '../types/tools';

/**
 * Available tools configuration
 */
export const TOOLS: ToolMetadata[] = [
  {
    id: 'base64',
    name: 'Base64 编码/解码',
    description: 'Base64 编码和解码工具，支持文本和URL安全格式',
    icon: '🔐',
    category: ToolCategory.ENCODER,
    path: '/base64',
  },
  {
    id: 'url',
    name: 'URL 编码/解码',
    description: 'URL编码解码，encodeURIComponent和decodeURIComponent',
    icon: '🔗',
    category: ToolCategory.ENCODER,
    path: '/url',
  },
  {
    id: 'json',
    name: 'JSON 格式化',
    description: 'JSON格式化、压缩、验证和美化工具',
    icon: '📋',
    category: ToolCategory.FORMATTER,
    path: '/json',
  },
  {
    id: 'hash',
    name: 'Hash 生成器',
    description: '生成SHA-1、SHA-256、SHA-512等哈希值',
    icon: '🔑',
    category: ToolCategory.GENERATOR,
    path: '/hash',
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: 'Unix时间戳与日期时间相互转换',
    icon: '⏰',
    category: ToolCategory.CONVERTER,
    path: '/timestamp',
  },
  {
    id: 'unicode',
    name: 'Unicode 转换',
    description: 'Unicode编码解码，支持\\uXXXX格式',
    icon: '🔤',
    category: ToolCategory.CONVERTER,
    path: '/unicode',
  },
  {
    id: 'color',
    name: '颜色转换',
    description: 'HEX、RGB、HSL颜色格式互转',
    icon: '🎨',
    category: ToolCategory.CONVERTER,
    path: '/color',
  },
  {
    id: 'regex',
    name: '正则测试',
    description: '正则表达式测试和匹配工具',
    icon: '🔍',
    category: ToolCategory.TESTER,
    path: '/regex',
  },
];

/**
 * Get tool by ID
 */
export const getToolById = (id: string): ToolMetadata | undefined => {
  return TOOLS.find((tool) => tool.id === id);
};

/**
 * Get tools by category
 */
export const getToolsByCategory = (category: ToolCategory): ToolMetadata[] => {
  return TOOLS.filter((tool) => tool.category === category);
};
