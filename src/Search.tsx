import React from 'react';
import AccountForm from './entry/EntryForm';

interface SearchPops {
  searchKey: string;
  groupTree: {};
}

interface groupDicType {
  parentId: string;
}

export default class Search extends React.Component<SearchPops> {
  state = {
    list: [],
    selectedIndex: 0
  };

  groupId2NameCache = {};

  groupDic = {};

  keydownAction = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      if (this.state.list.length < 2) return;
      e.preventDefault();
      const { list, selectedIndex } = this.state;
      if (e.code === 'ArrowUp') {
        if (selectedIndex === 0) {
          this.setState({ selectedIndex: list.length - 1 });
        } else {
          this.setState({ selectedIndex: selectedIndex - 1 });
        }
      } else {
        if (selectedIndex === list.length - 1) {
          this.setState({ selectedIndex: 0 });
        } else {
          this.setState({ selectedIndex: selectedIndex + 1 });
        }
      }
    }
  };

  componentDidMount() {
    this.generateGroupDic(this.props.groupTree, this.groupDic);
    this.search(this.props.searchKey);
    window.addEventListener('keydown', this.keydownAction);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keydownAction);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line
    if (this.props.searchKey !== nextProps.searchKey) {
      this.search(nextProps.searchKey);
    }
  }

  getGroupName = (id: string, groupName: string) => {
    const name = this.groupDic[id].name + (groupName ? '-' : '') + groupName;
    if (this.groupDic[id].parentId) {
      return this.getGroupName(this.groupDic[id].parentId, name);
    } else {
      return name;
    }
  };

  generateGroupDic = (arr, dic) => {
    for (const g of arr) {
      dic[g._id] = g;
      if (g.childs) {
        this.generateGroupDic(g.childs, dic);
      }
    }
  };

  groupName = (id: string) => {
    if (id in this.groupId2NameCache) {
      return this.groupId2NameCache[id];
    }
    const groupName = this.getGroupName(id, '');
    this.groupId2NameCache[id] = groupName;
    return groupName;
  };

  search(key: string) {
    key = key.toLowerCase();
    const searchResult = [];
    // for (const id in this.props.decryptAccountDic) {
    //   const cdata = this.props.decryptAccountDic[id];
    //   const titleIndex = cdata.title
    //     ? cdata.title.toLowerCase().indexOf(key)
    //     : -1;
    //   const usernameIndex = cdata.username
    //     ? cdata.username.toLowerCase().indexOf(key)
    //     : -1;
    //   if (titleIndex === -1 && usernameIndex === -1) continue;
    //   let weight = 0;
    //   if (titleIndex === 0) {
    //     weight += 999 - cdata.title.length;
    //   }
    //   if (usernameIndex === 0) {
    //     weight += 999 - cdata.username.length;
    //   }
    //   if (titleIndex > 0) {
    //     weight += 99 - titleIndex;
    //   }
    //   if (usernameIndex > 0) {
    //     weight += 99 - usernameIndex;
    //   }
    //   searchResult.push({ row: cdata, weight });
    // }

    if (searchResult.length > 0) {
      this.setState({
        list: searchResult
          .sort((a, b) => b.weight - a.weight)
          .map((x) => x.row),
        selectedIndex: 0
      });
    } else {
      this.setState({ list: [], selectedIndex: 0 });
    }
  }

  select = (index: number) => {
    if (index === this.state.selectedIndex) return;
    this.setState({ selectedIndex: index });
  };

  render() {
    if (this.state.list.length === 0)
      return <div className='search-empty'>未检索到数据</div>;

    const { keyIV, onAccountUpdate } = this.props;
    const { list, selectedIndex } = this.state;

    return (
      <div className='search-body'>
        <div className='search-list'>
          <table>
            <thead>
              <tr>
                <th>分组</th>
                <th>标题</th>
                <th>用户名</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a, i) => (
                <tr
                  onClick={() => this.select(i)}
                  className={selectedIndex === i ? 'search-selected' : null}
                  key={a.account._id}
                >
                  <td span={8}>{this.groupName(a.account.groupId)}</td>
                  <td id={a.account._id + '_title'} span={8}>
                    {a.title}
                  </td>
                  <td id={a.account._id + '_username'} span={8}>
                    {a.username}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='search-form'>
          {
            <AccountForm
              keyIV={keyIV}
              onUpdate={onAccountUpdate}
              data={list[selectedIndex].account}
            />
          }
        </div>
      </div>
    );
  }
}
