<template>
  <div class="aui-tasks">
    <Table border :data="tasks" :columns="columns"
           @on-sort-change="onSort"
           @on-row-click="onClickRow"
    >
      <template #users="{ row, index }">
        <i v-for="user in row.users" :key="user.id">{{ user.nickname }}</i>
      </template>
      <template #name="{row, index}">
        <span class="aui-i-taskname-link">{{ row.name }}</span>
      </template>
    </Table>
    <div class="aui-paginator">
      <Page
          :total="pageInfo.total_count"
          :current="pageInfo.cur_page"
          :page-size="pageInfo.page_size"
          size="small"
          @on-change="onChangePage"
          show-elevator
      ></Page>
    </div>
  </div>
</template>

<script>
import TaskService from '@/business/task_service';

export default {
  props: ['projectId'],
  components: {},
  created() {
    this.getTasks();
  },
  methods: {
    resetData() {
      this.filters = {};
      this.orderFields = [];
      this.pageInfo['cur_page'] = 1;
    },
    onTaskAdded() {
      this.resetData();
      this.getTasks();
    },
    onChangePage(targetPageNum) {
      this.pageInfo.targetPage = targetPageNum;
      this.getTasks();
    },
    onClickRow(row, index) {
      if (row._disableExpand) {
        return;
      }
      for (let node of this.$children) {
        if (node.classes && node.classes.includes("ivu-table")) {
          node.toggleExpand(index);
        }
      }
    },
    onSort(data) {
      this.orderFields = [];
      let orderType = data['order'];
      let field = data['key'];
      let orderFields = [];
      if (orderType === 'asc') {
        this.orderFields.push(field);
      } else {
        this.orderFields.push('-' + field);
      }
      this.getTasks();
    },
    getTasks() {
      let page = {
        cur_page: this.pageInfo.targetPage,
        count_per_page: this.pageInfo.count_per_page
      };
      let withOptions = {
        'with_users': true,
        'with_sub_tasks': true,
        'with_detail': true
      };
      TaskService.getTasks(this.projectId, this.filters, withOptions, this.orderFields, page).then(data => {
        this.tasks = data['tasks'];
        this.pageInfo = data['page_info'];
        this.pageInfo.targetPage = this.pageInfo.cur_page;
        this.tasks.map((task) => {
          if (!task.sub_tasks || task.sub_tasks.length === 0) {
            task['_disableExpand'] = true;
          }
        })
      }).catch(err => {
        this.$Message.warning(err.errMsg);
      })
    }
  },
  data() {
    return {
      'filters': {},
      'orderFields': [],
      'tasks': [],
      'pageInfo': {
        'targetPage': 1,
        'cur_page': 1,
        'page_size': 15,
        'total_count': 0
      },
      'projectUsers': [{
        'id': 0,
        'nickname': '全部'
      }],
      'importanceOptions': [{
        'label': '全部',
        'value': 0
      }, {
        'label': '非常紧急',
        'value': '70, 100'
      }, {
        'label': '紧急',
        'value': '50, 70'
      }, {
        'label': '普通',
        'value': '1, 50'
      }],
      'statusOptions': [{
        'label': '全部',
        'value': -1
      }, {
        'label': '未开始',
        'value': 0
      }, {
        'label': '进行中',
        'value': 1
      }, {
        'label': '已完成',
        'value': 2
      }, {
        'label': '已放弃',
        'value': 3
      }],
      'columns': [{
        'title': '编号',
        'key': 'id',
        'sortable': 'custom',
        'width': 90,
        'align': 'center'
      }, {
        'title': '标题',
        'key': 'name',
        'minWidth': 150,
        'slot': 'name'
      }, {
        'title': '优先级',
        'key': 'importance',
        'sortable': 'custom',
        'width': 120,
        'align': 'center',
        'filters': [{
          'label': '普通',
          'value': 0
        }, {
          'label': '紧急',
          'value': 1
        }, {
          'label': '非常紧急',
          'value': 2
        }],
        'filterMultiple': false,
        'filterRemote': (values) => {
          if (values.length === 0) {
            delete this.filters['importance__range'];
          } else {
            let level = values[0]
            let importance = [];
            if (level === 0) {
              importance = [0, 3];
            } else if (level === 1) {
              importance = [4, 6];
            } else if (level === 2) {
              importance = [7, 9];
            }
            this.filters['importance__range'] = importance;
          }
          this.getTasks();
        }
      }, {
        'title': '参与用户',
        'key': 'users',
        'slot': 'users'
      }, {
        'title': '创建时间',
        'key': 'created_at',
        'className': 'aui-i-timewidth',
        'sortable': 'custom',
        'width': 180
      }, {
        'title': '最后更新时间',
        'key': 'updated_at',
        'className': 'aui-i-timewidth',
        'sortable': 'custom',
        'width': 180
      }, {
        'title': '状态',
        'key': 'status',
        'width': 120,
        'filters': [{
          'label': '未开始',
          'value': 0
        }, {
          'label': '进行中',
          'value': 1
        }, {
          'label': '已完成',
          'value': 2
        }, {
          'label': '已放弃',
          'value': 3
        }],
        'filterMultiple': false,
        'filterRemote': (values) => {
          if (values.length === 0) {
            delete this.filters['status'];
          } else {
            this.filters['status'] = values[0];
          }
          this.getTasks();
        }
      }]
    }
  }
}
</script>

<style scoped lang="less">
.aui-tasks {
  margin: 0 30px 0 8px;

  .aui-i-timewidth {
    display: table-cell;
  }

  .aui-i-taskname-link {
    word-wrap: break-word;
    cursor: pointer;

    &:hover {
      color: indianred;
    }
  }
}
</style>
