import Resource from '@/utils/resource'

class ReleaseService {

    static getReleases(filters, pageInfo) {
        return Resource.get({
            'resource': 'system.releases',
            'data': {
                filters: filters,
                cur_page: pageInfo.curPage,
                page_size: pageInfo.pageSize
            }
        })
    }

    static newRelease(version, label, title, detail, outlines) {
        return Resource.put({
            'resource': 'system.release',
            'data': {
                'version': version,
                'label': label,
                'title': title,
                'detail': detail,
                'outlines': outlines
            }
        })
    }

    static updateRelease(id, version, label, title, detail, outlines) {
        return Resource.post({
            'resource': 'system.release',
            'data': {
                'id': id,
                'version': version,
                'label': label,
                'title': title,
                'detail': detail,
                'outlines': outlines
            }
        })
    }

}

export default ReleaseService
